import { Location } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);

    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Generate intermediate waypoints between two locations
 */
export function generateWaypoints(start: Location, end: Location, numPoints: number = 10): Location[] {
    const waypoints: Location[] = [];

    for (let i = 0; i <= numPoints; i++) {
        const ratio = i / numPoints;
        waypoints.push({
            latitude: start.latitude + (end.latitude - start.latitude) * ratio,
            longitude: start.longitude + (end.longitude - start.longitude) * ratio
        });
    }

    return waypoints;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

/**
 * Get current time segment (for rush hour detection)
 */
export function getTimeSegment(): 'morning_rush' | 'evening_rush' | 'normal' | 'night' {
    const hour = new Date().getHours();

    if (hour >= 8 && hour <= 10) return 'morning_rush';
    if (hour >= 18 && hour <= 20) return 'evening_rush';
    if (hour >= 22 || hour <= 6) return 'night';
    return 'normal';
}
