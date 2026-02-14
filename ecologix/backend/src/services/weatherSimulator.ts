import { WeatherCondition } from '../types';

/**
 * Weather Simulator - Mock weather API with realistic conditions
 */
class WeatherSimulator {
    private currentWeather: Map<string, WeatherCondition> = new Map();

    /**
     * Get weather for a location
     */
    getWeatherForLocation(latitude: number, longitude: number): WeatherCondition {
        const locationKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

        // Check cache
        if (this.currentWeather.has(locationKey) && Math.random() > 0.2) {
            return this.currentWeather.get(locationKey)!;
        }

        // Simulate weather based on time and randomness
        const hour = new Date().getHours();
        let weatherType: WeatherCondition['type'] = 'clear';
        let visibility = 1.0;
        let impact = 0;

        // Weather patterns
        const rand = Math.random();

        if (rand < 0.7) {
            // 70% clear
            weatherType = 'clear';
            visibility = 0.95 + Math.random() * 0.05;
            impact = 0;
        } else if (rand < 0.85) {
            // 15% light rain
            weatherType = 'rain';
            visibility = 0.7 + Math.random() * 0.2;
            impact = 0.15;
        } else if (rand < 0.92) {
            // 7% fog (more common at night/early morning)
            if (hour >= 22 || hour <= 6) {
                weatherType = 'fog';
                visibility = 0.4 + Math.random() * 0.3;
                impact = 0.25;
            } else {
                weatherType = 'clear';
                visibility = 0.9;
                impact = 0;
            }
        } else {
            // 8% heavy rain
            weatherType = 'heavy_rain';
            visibility = 0.3 + Math.random() * 0.3;
            impact = 0.35;
        }

        const weather: WeatherCondition = {
            type: weatherType,
            visibility,
            impact
        };

        this.currentWeather.set(locationKey, weather);
        return weather;
    }

    /**
     * Get average weather impact for a route
     */
    getRouteWeatherImpact(waypoints: Array<{ latitude: number; longitude: number }>): number {
        let totalImpact = 0;

        // Sample every 3rd waypoint to simulate regional weather
        for (let i = 0; i < waypoints.length; i += 3) {
            const wp = waypoints[i];
            const weather = this.getWeatherForLocation(wp.latitude, wp.longitude);
            totalImpact += weather.impact;
        }

        return totalImpact / Math.ceil(waypoints.length / 3);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.currentWeather.clear();
    }
}

export default new WeatherSimulator();
