export interface Location {
    latitude: number;
    longitude: number;
    timestamp?: Date | string;
}

export interface Truck {
    _id: string;
    truckId: string;
    registrationNumber: string;
    driverName: string;
    currentLocation: Location;
    status: 'active' | 'idle' | 'offline';
    activeRouteId?: string;
    fuelCapacity: number;
    averageConsumption: number;
    createdAt: string;
    updatedAt: string;
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

export interface Route {
    _id: string;
    routeId: string;
    truckId: string;
    origin: Location & { address: string };
    destination: Location & { address: string };
    waypoints: Location[];
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    metrics: RouteMetrics;
    trafficData: TrafficSegment[];
    recalculations: RouteRecalculation[];
    createdAt: string;
    completedAt?: string;
}

export interface TrafficSegment {
    segmentId: string;
    congestionLevel: number;
    timestamp: Date | string;
}

export interface RouteRecalculation {
    timestamp: Date | string;
    reason: string;
    newRoute: Location[];
    expectedSavings: {
        fuel: number;
        time: number;
    };
}

export interface Alert {
    id: string;
    type: 'traffic' | 'weather' | 'route_change';
    message: string;
    fuelSavings?: number;
    timeSavings?: number;
    timestamp: Date | string;
}

export interface Analytics {
    totalRoutes: number;
    totalDistance: number;
    totalFuelSaved: number;
    totalCO2Reduced: number;
    totalTimeSaved: number;
    truckCount?: number;
    activeTrucks?: number;
    averageFuelSaved?: number;
}

export interface EmissionData {
    date: string;
    fuelSaved: number;
    co2Reduced: number;
    routes: number;
}
