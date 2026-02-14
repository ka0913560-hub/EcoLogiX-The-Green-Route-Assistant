'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSocket } from '../hooks/useSocket';
import apiClient from '../services/api';
import { Alert, Route, Truck } from '../types';
import Link from 'next/link';

// Dynamically import Leaflet (client-side only)
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

export default function DriverDashboard() {
    const [truck, setTruck] = useState<Truck | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [currentPosition, setCurrentPosition] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [todayMetrics, setTodayMetrics] = useState({
        fuelSaved: 0,
        co2Reduced: 0,
        timeSaved: 0,
        distance: 0
    });
    const [isRouteActive, setIsRouteActive] = useState(false);

    const { socket, isConnected, on, off, emit } = useSocket();

    // Demo truck ID (in real app, would come from auth)
    const demoTruckId = 'truck_demo_001';

    useEffect(() => {
        // Initialize demo data
        initializeDemoData();

        // Setup socket listeners
        if (socket) {
            on('position:updated', handlePositionUpdate);
            on('route:optimized', handleRouteOptimized);
            on('alert:new', handleNewAlert);
            on('route:completed', handleRouteCompleted);
        }

        return () => {
            if (socket) {
                off('position:updated');
                off('route:optimized');
                off('alert:new');
                off('route:completed');
            }
        };
    }, [socket]);

    const initializeDemoData = async () => {
        try {
            // Create demo truck if doesn't exist
            const trucksResponse: any = await apiClient.getTrucks();
            let demoTruck = trucksResponse.data?.find((t: Truck) => t.truckId === demoTruckId);

            if (!demoTruck) {
                const createResponse: any = await apiClient.createTruck({
                    registrationNumber: 'DL-01-AB-1234',
                    driverName: 'Raj Kumar',
                    fuelCapacity: 300,
                    averageConsumption: 0.3
                });
                demoTruck = createResponse.data;
            }

            setTruck(demoTruck);

            // Create demo route
            const routeResponse: any = await apiClient.createRoute({
                truckId: demoTruck.truckId,
                origin: {
                    lat: 28.6139,
                    lng: 77.2090,
                    address: 'New Delhi, India'
                },
                destination: {
                    lat: 28.5355,
                    lng: 77.3910,
                    address: 'Noida, India'
                }
            });

            if (routeResponse.success) {
                setRoute(routeResponse.data.route);
                setCurrentPosition(routeResponse.data.route.waypoints[0]);
            }
        } catch (error) {
            console.error('Failed to initialize demo:', error);
        }
    };

    const handlePositionUpdate = (data: any) => {
        setCurrentPosition(data.position);
        setProgress(data.progress);
    };

    const handleRouteOptimized = (data: any) => {
        if (route) {
            setRoute({ ...route, waypoints: data.newWaypoints });
        }
    };

    const handleNewAlert = (data: Alert) => {
        setAlerts(prev => [data, ...prev].slice(0, 5)); // Keep last 5 alerts
    };

    const handleRouteCompleted = () => {
        setIsRouteActive(false);
        // Update metrics
        if (route) {
            setTodayMetrics({
                fuelSaved: route.metrics.fuelSaved,
                co2Reduced: route.metrics.co2Reduced,
                timeSaved: route.metrics.timeSaved,
                distance: route.metrics.totalDistance
            });
        }
    };

    const startRoute = () => {
        if (route && socket) {
            emit('route:start', { routeId: route.routeId });
            setIsRouteActive(true);
        }
    };

    const acknowledgeAlert = (alertId: string) => {
        if (socket) {
            emit('alert:acknowledge', { alertId });
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold gradient-text">EcoLogiX</Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        {truck && (
                            <div className="text-sm">
                                <div className="font-semibold">{truck.driverName}</div>
                                <div className="text-gray-600">{truck.registrationNumber}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Map Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map */}
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Live Route</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Progress: {progress}%</span>
                                    {!isRouteActive && route && (
                                        <button onClick={startRoute} className="btn-primary text-sm px-4 py-2">
                                            Start Route
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="h-[500px] bg-gray-100 rounded-xl overflow-hidden">
                                {route && (
                                    <MapComponent
                                        waypoints={route.waypoints}
                                        currentPosition={currentPosition || route.waypoints[0]}
                                        origin={route.origin}
                                        destination={route.destination}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Today's Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="metric-card">
                                <div className="text-3xl font-bold text-green-600 mb-1">{todayMetrics.fuelSaved.toFixed(1)}L</div>
                                <div className="text-sm text-gray-600">Fuel Saved</div>
                            </div>
                            <div className="metric-card">
                                <div className="text-3xl font-bold text-emerald-600 mb-1">{todayMetrics.co2Reduced.toFixed(1)}kg</div>
                                <div className="text-sm text-gray-600">CO₂ Reduced</div>
                            </div>
                            <div className="metric-card">
                                <div className="text-3xl font-bold text-blue-600 mb-1">{todayMetrics.timeSaved}min</div>
                                <div className="text-sm text-gray-600">Time Saved</div>
                            </div>
                            <div className="metric-card">
                                <div className="text-3xl font-bold text-purple-600 mb-1">{todayMetrics.distance.toFixed(0)}km</div>
                                <div className="text-sm text-gray-600">Distance</div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Alerts Panel */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Driver Alerts
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                                {alerts.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No active alerts</div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${alert.type === 'route_change' ? 'bg-green-50 border-green-500' :
                                            alert.type === 'traffic' ? 'bg-yellow-50 border-yellow-500' :
                                                'bg-blue-50 border-blue-500'
                                            }`}>
                                            <p className="font-medium text-sm mb-2">{alert.message}</p>
                                            {(alert.fuelSavings || alert.timeSavings) && (
                                                <div className="flex gap-3 text-xs text-gray-600 mb-2">
                                                    {alert.fuelSavings && alert.fuelSavings > 0 && (
                                                        <span>⛽ {alert.fuelSavings.toFixed(1)}L saved</span>
                                                    )}
                                                    {alert.timeSavings && alert.timeSavings > 0 && (
                                                        <span>⏱️ {alert.timeSavings}min saved</span>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="text-xs text-green-600 hover:text-green-700 font-medium"
                                            >
                                                Acknowledge
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Route Info */}
                        {route && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold mb-4">Route Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="text-gray-600 font-medium">Origin</div>
                                        <div>{route.origin.address}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 font-medium">Destination</div>
                                        <div>{route.destination.address}</div>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-gray-600">Distance</div>
                                                <div className="font-semibold">{route.metrics.totalDistance.toFixed(1)} km</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Est. Time</div>
                                                <div className="font-semibold">{route.metrics.estimatedDuration} min</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="text-gray-600 mb-1">Recalculations</div>
                                        <div className="font-semibold text-green-600">{route.recalculations.length} times</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
