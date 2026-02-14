import { getTimeSegment } from '../utils/helpers';

export interface TrafficData {
    segmentId: string;
    congestionLevel: number; // 0-1 scale (0 = clear, 1 = heavily congested)
    speed: number; // km/h
    incidents: boolean;
}

/**
 * Traffic Simulator - Mock traffic API with realistic patterns
 */
class TrafficSimulator {
    private trafficCache: Map<string, TrafficData> = new Map();
    private incidentProbability = 0.05; // 5% chance of incident

    /**
     * Get traffic data for a road segment
     */
    getTrafficForSegment(segmentId: string, latitude: number, longitude: number): TrafficData {
        const cached = this.trafficCache.get(segmentId);

        // Cache traffic data for 2 minutes
        if (cached && Math.random() > 0.3) {
            return cached;
        }

        const timeSegment = getTimeSegment();
        let baseCongestion = 0.2; // Base 20% congestion

        // Time-based patterns
        switch (timeSegment) {
            case 'morning_rush':
            case 'evening_rush':
                baseCongestion = 0.6 + Math.random() * 0.3; // 60-90% congestion
                break;
            case 'normal':
                baseCongestion = 0.2 + Math.random() * 0.3; // 20-50% congestion
                break;
            case 'night':
                baseCongestion = 0.05 + Math.random() * 0.15; // 5-20% congestion
                break;
        }

        // Location-based variation (simulating urban vs highway)
        const locationFactor = (Math.abs(latitude) % 1) * 0.3;
        const congestionLevel = Math.min(0.95, baseCongestion + locationFactor);

        // Random incidents
        const incidents = Math.random() < this.incidentProbability;
        const finalCongestion = incidents ? Math.min(0.95, congestionLevel + 0.2) : congestionLevel;

        // Speed based on congestion (assuming max speed 60 km/h in city)
        const speed = 60 * (1 - finalCongestion);

        const trafficData: TrafficData = {
            segmentId,
            congestionLevel: finalCongestion,
            speed,
            incidents
        };

        this.trafficCache.set(segmentId, trafficData);
        return trafficData;
    }

    /**
     * Get average traffic for a route
     */
    getRouteTraffic(waypoints: Array<{ latitude: number; longitude: number }>): number {
        let totalCongestion = 0;

        waypoints.forEach((wp, index) => {
            const segmentId = `seg_${index}`;
            const traffic = this.getTrafficForSegment(segmentId, wp.latitude, wp.longitude);
            totalCongestion += traffic.congestionLevel;
        });

        return totalCongestion / waypoints.length;
    }

    /**
     * Clear cache (call periodically)
     */
    clearCache(): void {
        this.trafficCache.clear();
    }
}

export default new TrafficSimulator();
