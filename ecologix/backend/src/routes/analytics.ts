import { Router, Request, Response } from 'express';
import Analytics from '../models/Analytics';
import Route from '../models/Route';
import Truck from '../models/Truck';
import congestionPredictor from '../services/congestionPredictor';

const router = Router();

/**
 * GET /api/analytics/truck/:id - Get truck-specific analytics
 */
router.get('/truck/:id', async (req: Request, res: Response) => {
    try {
        const { period = '7d' } = req.query;
        const daysBack = period === '30d' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const analytics = await Analytics.find({
            truckId: req.params.id,
            date: { $gte: startDate }
        }).sort({ date: 1 });

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/analytics/fleet - Get fleet-wide analytics
 */
router.get('/fleet', async (req: Request, res: Response) => {
    try {
        // Get all completed routes
        const routes = await Route.find({ status: 'completed' });

        // Aggregate metrics
        const totalMetrics = routes.reduce((acc, route) => {
            return {
                totalRoutes: acc.totalRoutes + 1,
                totalDistance: acc.totalDistance + route.metrics.totalDistance,
                totalFuelSaved: acc.totalFuelSaved + route.metrics.fuelSaved,
                totalCO2Reduced: acc.totalCO2Reduced + route.metrics.co2Reduced,
                totalTimeSaved: acc.totalTimeSaved + route.metrics.timeSaved
            };
        }, {
            totalRoutes: 0,
            totalDistance: 0,
            totalFuelSaved: 0,
            totalCO2Reduced: 0,
            totalTimeSaved: 0
        });

        // Get truck count
        const truckCount = await Truck.countDocuments();

        // Get active trucks
        const activeTrucks = await Truck.countDocuments({ status: 'active' });

        res.json({
            success: true,
            data: {
                ...totalMetrics,
                truckCount,
                activeTrucks,
                averageFuelSaved: totalMetrics.totalRoutes > 0 ?
                    Math.round((totalMetrics.totalFuelSaved / totalMetrics.totalRoutes) * 100) / 100 : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch fleet analytics' });
    }
});

/**
 * GET /api/analytics/predictions - Get congestion predictions
 */
router.get('/predictions', async (req: Request, res: Response) => {
    try {
        const { segments = 10 } = req.query;
        const segmentCount = Math.min(parseInt(segments as string), 20);

        const predictions = Array.from({ length: segmentCount }, (_, idx) => {
            const segmentId = `seg_${idx}`;
            return {
                segmentId,
                prediction: congestionPredictor.predictCongestion(segmentId),
                timestamp: new Date()
            };
        });

        const modelInfo = congestionPredictor.getModelInfo();

        res.json({
            success: true,
            data: {
                predictions,
                model: modelInfo
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch predictions' });
    }
});

/**
 * GET /api/analytics/emissions - Get emission reports
 */
router.get('/emissions', async (req: Request, res: Response) => {
    try {
        const { truckId, period = '7d' } = req.query;
        const daysBack = period === '30d' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const query: any = {
            status: 'completed',
            createdAt: { $gte: startDate }
        };

        if (truckId) {
            query.truckId = truckId;
        }

        const routes = await Route.find(query);

        // Daily breakdown
        const dailyEmissions = routes.reduce((acc: any, route) => {
            const date = route.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    date,
                    fuelSaved: 0,
                    co2Reduced: 0,
                    routes: 0
                };
            }
            acc[date].fuelSaved += route.metrics.fuelSaved;
            acc[date].co2Reduced += route.metrics.co2Reduced;
            acc[date].routes += 1;
            return acc;
        }, {});

        res.json({
            success: true,
            data: Object.values(dailyEmissions)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch emissions' });
    }
});

export default router;
