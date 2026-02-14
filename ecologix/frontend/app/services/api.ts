const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Trucks
    async getTrucks() {
        return this.request('/api/trucks');
    }

    async getTruck(id: string) {
        return this.request(`/api/trucks/${id}`);
    }

    async createTruck(data: any) {
        return this.request('/api/trucks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTruck(id: string, data: any) {
        return this.request(`/api/trucks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Routes
    async createRoute(data: any) {
        return this.request('/api/routes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getRoute(id: string) {
        return this.request(`/api/routes/${id}`);
    }

    async optimizeRoute(id: string, currentPosition: any, reason?: string) {
        return this.request(`/api/routes/${id}/optimize`, {
            method: 'POST',
            body: JSON.stringify({ currentPosition, reason }),
        });
    }

    async getRouteTraffic(id: string) {
        return this.request(`/api/routes/${id}/traffic`);
    }

    async completeRoute(id: string, metrics: any) {
        return this.request(`/api/routes/${id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({ metrics }),
        });
    }

    // Analytics
    async getTruckAnalytics(id: string, period: string = '7d') {
        return this.request(`/api/analytics/truck/${id}?period=${period}`);
    }

    async getFleetAnalytics() {
        return this.request('/api/analytics/fleet');
    }

    async getPredictions(segments: number = 10) {
        return this.request(`/api/analytics/predictions?segments=${segments}`);
    }

    async getEmissions(period: string = '7d', truckId?: string) {
        const query = truckId ? `?period=${period}&truckId=${truckId}` : `?period=${period}`;
        return this.request(`/api/analytics/emissions${query}`);
    }
}

export default new ApiClient();
