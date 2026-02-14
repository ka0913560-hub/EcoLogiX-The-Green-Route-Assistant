import { Location } from '../types';
import { calculateDistance } from '../utils/helpers';

export interface EmissionResult {
    fuelUsed: number; // liters
    co2Emitted: number; // kg
    baselineFuel: number; // what it would have been without optimization
    baselineCO2: number;
    fuelSaved: number;
    co2Reduced: number;
}

/**
 * Emission Calculator - Calculate fuel consumption and CO2 emissions
 */
class EmissionCalculator {
    private readonly CO2_PER_LITER = 2.68; // kg CO2 per liter of diesel
    private readonly BASE_CONSUMPTION = 0.3; // L/km baseline

    /**
     * Calculate fuel consumption for a route
     */
    calculateFuelConsumption(
        waypoints: Location[],
        trafficCongestion: number,
        weatherImpact: number,
        idleTime: number = 0 // minutes
    ): number {
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
        }

        // Base fuel consumption
        let baseFuel = totalDistance * this.BASE_CONSUMPTION;

        // Traffic penalty (congestion increases fuel by up to 150%)
        const trafficMultiplier = 1 + (trafficCongestion * 1.5);

        // Weather penalty (bad weather increases fuel by up to 40%)
        const weatherMultiplier = 1 + (weatherImpact * 0.4);

        // Idle time penalty (0.5L per hour of idling)
        const idleFuel = (idleTime / 60) * 0.5;

        const totalFuel = (baseFuel * trafficMultiplier * weatherMultiplier) + idleFuel;

        return Math.round(totalFuel * 100) / 100;
    }

    /**
     * Calculate CO2 emissions
     */
    calculateCO2(fuelUsed: number): number {
        return Math.round(fuelUsed * this.CO2_PER_LITER * 100) / 100;
    }

    /**
     * Calculate savings compared to baseline (non-optimized) route
     */
    calculateSavings(
        optimizedWaypoints: Location[],
        optimizedTraffic: number,
        optimizedWeather: number,
        baselineTraffic: number = 0.6, // Assume worse traffic without optimization
        baselineWeather: number = 0.1
    ): EmissionResult {
        // Optimized route
        const fuelUsed = this.calculateFuelConsumption(
            optimizedWaypoints,
            optimizedTraffic,
            optimizedWeather
        );
        const co2Emitted = this.calculateCO2(fuelUsed);

        // Baseline (assume 20% longer route and worse conditions)
        let totalDistance = 0;
        for (let i = 0; i < optimizedWaypoints.length - 1; i++) {
            totalDistance += calculateDistance(optimizedWaypoints[i], optimizedWaypoints[i + 1]);
        }
        const baselineDistance = totalDistance * 1.2;
        const baselineFuel = baselineDistance * this.BASE_CONSUMPTION *
            (1 + baselineTraffic * 1.5) * (1 + baselineWeather * 0.4);
        const baselineCO2 = this.calculateCO2(baselineFuel);

        return {
            fuelUsed,
            co2Emitted,
            baselineFuel: Math.round(baselineFuel * 100) / 100,
            baselineCO2: Math.round(baselineCO2 * 100) / 100,
            fuelSaved: Math.round((baselineFuel - fuelUsed) * 100) / 100,
            co2Reduced: Math.round((baselineCO2 - co2Emitted) * 100) / 100
        };
    }

    /**
     * Calculate estimated time saved (in minutes)
     */
    calculateTimeSavings(
        optimizedDistance: number,
        optimizedTraffic: number,
        baselineDistance: number,
        baselineTraffic: number = 0.6
    ): number {
        const optimizedSpeed = 40 * (1 - optimizedTraffic); // km/h
        const baselineSpeed = 40 * (1 - baselineTraffic);

        const optimizedTime = (optimizedDistance / optimizedSpeed) * 60; // minutes
        const baselineTime = (baselineDistance / baselineSpeed) * 60;

        return Math.round(baselineTime - optimizedTime);
    }
}

export default new EmissionCalculator();
