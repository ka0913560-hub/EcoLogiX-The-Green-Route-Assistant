import { Router, Request, Response } from 'express';
import Route from '../models/Route';
import Truck from '../models/Truck';
import { generateId } from '../utils/helpers';
import routeOptimizer from '../services/routeOptimizer';
import trafficSimulator from '../services/trafficSimulator';

const router = Router();

/**
 * POST /api/routes - Create and optimize new route
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { truckId, origin, destination } = req.body;

        // Verify truck exists
        const truck = await Truck.findOne({ truckId });
        if (!truck) {
            return res.status(404).json({ success: false, error: 'Truck not found' });
        }

        // Optimize route
        const optimizedRoute = await routeOptimizer.optimizeRoute(
            { latitude: origin.lat, longitude: origin.lng },
            { latitude: destination.lat, longitude: destination.lng }
        );

        // Create route document
        const route = new Route({
            routeId: generateId('route'),
            truckId,
            origin: {
                latitude: origin.lat,
                longitude: origin.lng,
                address: origin.address || 'Origin'
            },
            destination: {
                latitude: destination.lat,
                longitude: destination.lng,
                address: destination.address || 'Destination'
            },
            waypoints: optimizedRoute.waypoints,
            status: 'planned',
            metrics: {
                totalDistance: optimizedRoute.totalDistance,
                estimatedDuration: optimizedRoute.estimatedDuration,
                fuelUsed: 0,
                fuelSaved: 0,
                co2Emitted: 0,
                co2Reduced: 0,
                timeSaved: 0
            },
            trafficData: [],
            recalculations: []
        });

        await route.save();

        // Update truck
        truck.activeRouteId = route.routeId;
        truck.status = 'active';
        await truck.save();

        res.status(201).json({
            success: true,
            data: {
                route,
                optimization: optimizedRoute
            }
        });
    } catch (error) {
        console.error('Route creation error:', error);
        res.status(500).json({ success: false, error: 'Failed to create route' });
    }
});

/**
 * GET /api/routes/:id - Get route details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const route = await Route.findOne({ routeId: req.params.id });
        if (!route) {
            return res.status(404).json({ success: false, error: 'Route not found' });
        }
        res.json({ success: true, data: route });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch route' });
    }
});

/**
 * POST /api/routes/:id/optimize - Trigger route re-optimization
 */
router.post('/:id/optimize', async (req: Request, res: Response) => {
    try {
        const route = await Route.findOne({ routeId: req.params.id });
        if (!route) {
            return res.status(404).json({ success: false, error: 'Route not found' });
        }

        // Get current position (from last waypoint if not provided)
        const currentPos = req.body.currentPosition || route.waypoints[0];

        // Optimize from current position to destination
        const optimizedRoute = await routeOptimizer.optimizeRoute(
            currentPos,
            route.destination
        );

        // Save recalculation
        route.recalculations.push({
            timestamp: new Date(),
            reason: req.body.reason || 'Traffic conditions changed',
            newRoute: optimizedRoute.waypoints,
            expectedSavings: {
                fuel: req.body.expectedFuelSavings || 0,
                time: req.body.expectedTimeSavings || 0
            }
        });

        route.waypoints = optimizedRoute.waypoints;
        await route.save();

        res.json({ success: true, data: { route, optimization: optimizedRoute } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to optimize route' });
    }
});

/**
 * GET /api/routes/:id/traffic - Get live traffic data
 */
router.get('/:id/traffic', async (req: Request, res: Response) => {
    try {
        const route = await Route.findOne({ routeId: req.params.id });
        if (!route) {
            return res.status(404).json({ success: false, error: 'Route not found' });
        }

        // Get current traffic for route
        const trafficData = route.waypoints.map((wp, idx) => {
            const traffic = trafficSimulator.getTrafficForSegment(`seg_${idx}`, wp.latitude, wp.longitude);
            return {
                segmentId: `seg_${idx}`,
                congestionLevel: traffic.congestionLevel,
                speed: traffic.speed,
                incidents: traffic.incidents,
                location: wp
            };
        });

        res.json({ success: true, data: trafficData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch traffic data' });
    }
});

/**
 * PUT /api/routes/:id/complete - Mark route as completed
 */
router.put('/:id/complete', async (req: Request, res: Response) => {
    try {
        const route = await Route.findOne({ routeId: req.params.id });
        if (!route) {
            return res.status(404).json({ success: false, error: 'Route not found' });
        }

        route.status = 'completed';
        route.completedAt = new Date();
        route.metrics = { ...route.metrics, ...req.body.metrics };
        await route.save();

        // Update truck status
        const truck = await Truck.findOne({ truckId: route.truckId });
        if (truck) {
            truck.status = 'idle';
            truck.activeRouteId = undefined;
            await truck.save();
        }

        res.json({ success: true, data: route });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to complete route' });
    }
});

export default router;
