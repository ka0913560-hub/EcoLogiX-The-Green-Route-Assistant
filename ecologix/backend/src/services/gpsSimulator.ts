import { Location } from '../types';
import { calculateDistance } from '../utils/helpers';

/**
 * GPS Simulator - Simulates truck movement along a route
 */
class GPSSimulator {
    private activeTrucks: Map<string, {
        routeWaypoints: Location[];
        currentIndex: number;
        currentPosition: Location;
        speed: number; // km/h
        trafficImpact: number;
    }> = new Map();

    /**
     * Start simulating a truck's journey
     */
    startSimulation(
        truckId: string,
        routeWaypoints: Location[],
        initialSpeed: number = 40
    ): void {
        this.activeTrucks.set(truckId, {
            routeWaypoints,
            currentIndex: 0,
            currentPosition: routeWaypoints[0],
            speed: initialSpeed,
            trafficImpact: 0
        });
    }

    /**
     * Update truck position (call every 5 seconds)
     */
    updatePosition(truckId: string, trafficCongestion: number = 0): Location | null {
        const truck = this.activeTrucks.get(truckId);
        if (!truck) return null;

        // Check if route is complete
        if (truck.currentIndex >= truck.routeWaypoints.length - 1) {
            return truck.currentPosition;
        }

        const currentWaypoint = truck.routeWaypoints[truck.currentIndex];
        const nextWaypoint = truck.routeWaypoints[truck.currentIndex + 1];

        // Adjust speed based on traffic
        const effectiveSpeed = truck.speed * (1 - trafficCongestion * 0.6);

        // Distance covered in 5 seconds at current speed
        const distancePerUpdate = (effectiveSpeed / 3600) * 5; // km

        // Calculate distance to next waypoint
        const distanceToNext = calculateDistance(truck.currentPosition, nextWaypoint);

        if (distanceToNext <= distancePerUpdate) {
            // Reached next waypoint
            truck.currentIndex++;
            truck.currentPosition = nextWaypoint;
        } else {
            // Move towards next waypoint
            const ratio = distancePerUpdate / distanceToNext;
            truck.currentPosition = {
                latitude: truck.currentPosition.latitude +
                    (nextWaypoint.latitude - truck.currentPosition.latitude) * ratio,
                longitude: truck.currentPosition.longitude +
                    (nextWaypoint.longitude - truck.currentPosition.longitude) * ratio,
                timestamp: new Date()
            };
        }

        truck.trafficImpact = trafficCongestion;
        return truck.currentPosition;
    }

    /**
     * Get current position
     */
    getCurrentPosition(truckId: string): Location | null {
        const truck = this.activeTrucks.get(truckId);
        return truck ? truck.currentPosition : null;
    }

    /**
     * Get progress percentage
     */
    getProgress(truckId: string): number {
        const truck = this.activeTrucks.get(truckId);
        if (!truck) return 0;

        return Math.round((truck.currentIndex / (truck.routeWaypoints.length - 1)) * 100);
    }

    /**
     * Check if journey is complete
     */
    isComplete(truckId: string): boolean {
        const truck = this.activeTrucks.get(truckId);
        if (!truck) return true;

        return truck.currentIndex >= truck.routeWaypoints.length - 1;
    }

    /**
     * Update route (for recalculation)
     */
    updateRoute(truckId: string, newWaypoints: Location[]): void {
        const truck = this.activeTrucks.get(truckId);
        if (!truck) return;

        // Keep current position, update waypoints from current point
        truck.routeWaypoints = [truck.currentPosition, ...newWaypoints];
        truck.currentIndex = 0;
    }

    /**
     * Stop simulation
     */
    stopSimulation(truckId: string): void {
        this.activeTrucks.delete(truckId);
    }

    /**
     * Get all active trucks
     */
    getActiveTrucks(): string[] {
        return Array.from(this.activeTrucks.keys());
    }
}

export default new GPSSimulator();
