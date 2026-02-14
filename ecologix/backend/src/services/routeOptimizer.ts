import { Location } from '../types';
import { calculateDistance, generateWaypoints } from '../utils/helpers';
import trafficSimulator from './trafficSimulator';
import weatherSimulator from './weatherSimulator';
import emissionCalculator from './emissionCalculator';
import congestionPredictor from './congestionPredictor';

export interface OptimizedRoute {
    waypoints: Location[];
    totalDistance: number;
    estimatedDuration: number;
    fuelEstimate: number;
    co2Estimate: number;
    trafficScore: number;
    weatherScore: number;
    overallScore: number;
}

/**
 * Route Optimization Engine
 * Multi-factor route calculation with dynamic recalculation
 */
class RouteOptimizer {
    private readonly RECALCULATION_THRESHOLD = 0.3; // 30% change triggers recalculation

    /**
     * Calculate optimal route between origin and destination
     */
    async optimizeRoute(
        origin: Location,
        destination: Location,
        considerPredictions: boolean = true
    ): Promise<OptimizedRoute> {
        // Generate multiple route alternatives
        const routes = this.generateRouteAlternatives(origin, destination);

        // Score each route
        const scoredRoutes = await Promise.all(
            routes.map(route => this.scoreRoute(route, considerPredictions))
        );

        // Select best route (highest score = most efficient)
        const bestRoute = scoredRoutes.reduce((best, current) =>
            current.overallScore > best.overallScore ? current : best
        );

        return bestRoute;
    }

    /**
     * Generate alternative routes (simulated)
     */
    private generateRouteAlternatives(origin: Location, destination: Location): Location[][] {
        const routes: Location[][] = [];

        // Direct route
        const directRoute = generateWaypoints(origin, destination, 15);
        routes.push(directRoute);

        // Alternative route 1 (slight northern detour)
        const alt1 = generateWaypoints(origin, destination, 15).map((wp, idx) => ({
            latitude: wp.latitude + (Math.sin(idx * 0.5) * 0.01),
            longitude: wp.longitude
        }));
        routes.push(alt1);

        // Alternative route 2 (slight southern detour)
        const alt2 = generateWaypoints(origin, destination, 15).map((wp, idx) => ({
            latitude: wp.latitude - (Math.sin(idx * 0.5) * 0.01),
            longitude: wp.longitude
        }));
        routes.push(alt2);

        return routes;
    }

    /**
     * Score a route based on multiple factors
     */
    private async scoreRoute(
        waypoints: Location[],
        considerPredictions: boolean
    ): Promise<OptimizedRoute> {
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
        }

        // Get traffic congestion
        const currentTraffic = trafficSimulator.getRouteTraffic(waypoints);

        // Get predicted traffic if enabled
        let predictedTraffic = currentTraffic;
        if (considerPredictions) {
            const predictions = waypoints.map((wp, idx) =>
                congestionPredictor.predictCongestion(`seg_${idx}`)
            );
            predictedTraffic = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
        }

        // Use worse of current or predicted
        const trafficCongestion = Math.max(currentTraffic, predictedTraffic);

        // Get weather impact
        const weatherImpact = weatherSimulator.getRouteWeatherImpact(waypoints);

        // Calculate fuel and emissions
        const fuelEstimate = emissionCalculator.calculateFuelConsumption(
            waypoints,
            trafficCongestion,
            weatherImpact
        );
        const co2Estimate = emissionCalculator.calculateCO2(fuelEstimate);

        // Calculate estimated duration (assuming average 40 km/h with traffic adjustment)
        const baseSpeed = 40; // km/h
        const effectiveSpeed = baseSpeed * (1 - trafficCongestion * 0.5) * (1 - weatherImpact * 0.3);
        const estimatedDuration = (totalDistance / effectiveSpeed) * 60; // minutes

        // Multi-factor scoring
        // Weights: traffic (40%), weather (20%), distance (25%), predictions (15%)
        const trafficScore = 1 - trafficCongestion;
        const weatherScore = 1 - weatherImpact;
        const distanceScore = 1 / (1 + totalDistance / 50); // Normalize by typical 50km distance
        const predictionScore = considerPredictions ? (1 - predictedTraffic) : trafficScore;

        const overallScore =
            (trafficScore * 0.4) +
            (weatherScore * 0.2) +
            (distanceScore * 0.25) +
            (predictionScore * 0.15);

        return {
            waypoints,
            totalDistance: Math.round(totalDistance * 100) / 100,
            estimatedDuration: Math.round(estimatedDuration),
            fuelEstimate: Math.round(fuelEstimate * 100) / 100,
            co2Estimate: Math.round(co2Estimate * 100) / 100,
            trafficScore: Math.round(trafficScore * 100) / 100,
            weatherScore: Math.round(weatherScore * 100) / 100,
            overallScore: Math.round(overallScore * 1000) / 1000
        };
    }

    /**
     * Check if route needs recalculation based on traffic changes
     */
    shouldRecalculate(
        currentRoute: Location[],
        previousTraffic: number
    ): { shouldRecalculate: boolean; newTraffic: number; changePct: number } {
        const newTraffic = trafficSimulator.getRouteTraffic(currentRoute);
        const changePct = Math.abs(newTraffic - previousTraffic) / previousTraffic;

        return {
            shouldRecalculate: changePct > this.RECALCULATION_THRESHOLD,
            newTraffic,
            changePct: Math.round(changePct * 100)
        };
    }

    /**
     * Generate driver alert for route changes
     */
    generateAlert(
        oldRoute: OptimizedRoute,
        newRoute: OptimizedRoute,
        reason: string
    ): {
        message: string;
        fuelSavings: number;
        timeSavings: number;
    } {
        const fuelSavings = oldRoute.fuelEstimate - newRoute.fuelEstimate;
        const timeSavings = oldRoute.estimatedDuration - newRoute.estimatedDuration;

        let message = `${reason}. `;

        if (fuelSavings > 0 && timeSavings > 0) {
            message += `Recommended route change will save ${fuelSavings.toFixed(1)}L fuel and ${timeSavings} minutes.`;
        } else if (fuelSavings > 0) {
            message += `Recommended route change will save ${fuelSavings.toFixed(1)}L fuel.`;
        } else {
            message += `Route adjusted for optimal efficiency.`;
        }

        return {
            message,
            fuelSavings: Math.max(0, fuelSavings),
            timeSavings: Math.max(0, timeSavings)
        };
    }
}

export default new RouteOptimizer();
