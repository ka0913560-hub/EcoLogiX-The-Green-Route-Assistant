export interface Location {
    latitude: number;
    longitude: number;
    timestamp?: Date;
}

export interface TruckStatus {
    ACTIVE: 'active';
    IDLE: 'idle';
    OFFLINE: 'offline';
}

export interface RouteMetrics {
    totalDistance: number;
    estimatedDuration: number;
    actualDuration?: number;
    fuelUsed: number;
    fuelSaved: number;
    co2Emitted: number;
    co2Reduced: number;
    timeSaved: number;
}

export interface TrafficSegment {
    segmentId: string;
    congestionLevel: number; // 0-1 scale
    timestamp: Date;
}

export interface RouteRecalculation {
    timestamp: Date;
    reason: string;
    newRoute: Location[];
    expectedSavings: {
        fuel: number;
        time: number;
    };
}

export interface WeatherCondition {
    type: 'clear' | 'rain' | 'fog' | 'heavy_rain';
    visibility: number; // 0-1 scale
    impact: number; // 0-1 scale on route efficiency
}

export interface Alert {
    id: string;
    type: 'traffic' | 'weather' | 'route_change';
    message: string;
    fuelSavings?: number;
    timeSavings?: number;
    timestamp: Date;
}
