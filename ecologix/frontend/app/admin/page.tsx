'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '../services/api';
import { Analytics, Truck, EmissionData } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [fleetAnalytics, setFleetAnalytics] = useState<Analytics | null>(null);
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [emissions, setEmissions] = useState<EmissionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        // Refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load fleet analytics
            const analyticsResponse: any = await apiClient.getFleetAnalytics();
            if (analyticsResponse.success) {
                setFleetAnalytics(analyticsResponse.data);
            }

            // Load trucks
            const trucksResponse: any = await apiClient.getTrucks();
            if (trucksResponse.success) {
                setTrucks(trucksResponse.data);
            }

            // Load emissions data
            const emissionsResponse: any = await apiClient.getEmissions('7d');
            if (emissionsResponse.success) {
                setEmissions(emissionsResponse.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold gradient-text">EcoLogiX Admin</Link>
                    <div className="flex items-center gap-4">
                        <Link href="/driver" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Switch to Driver View
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Fleet Overview Stats */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">Fleet Overview</h1>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-6 hover-lift">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600 font-medium">Total Trucks</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-4xl font-bold text-blue-600">{fleetAnalytics?.truckCount || 0}</div>
                            <div className="text-sm text-green-600 font-medium mt-1">{fleetAnalytics?.activeTrucks || 0} active</div>
                        </div>

                        <div className="glass-card p-6 hover-lift">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600 font-medium">Fuel Saved</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-4xl font-bold text-green-600">{fleetAnalytics?.totalFuelSaved.toFixed(1) || '0'}L</div>
                            <div className="text-sm text-gray-600 mt-1">Across all routes</div>
                        </div>

                        <div className="glass-card p-6 hover-lift">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600 font-medium">CO₂ Reduced</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-4xl font-bold text-emerald-600">{fleetAnalytics?.totalCO2Reduced.toFixed(1) || '0'}kg</div>
                            <div className="text-sm text-gray-600 mt-1">Carbon emissions saved</div>
                        </div>

                        <div className="glass-card p-6 hover-lift">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600 font-medium">Time Saved</div>
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-4xl font-bold text-purple-600">{fleetAnalytics?.totalTimeSaved || '0'}min</div>
                            <div className="text-sm text-gray-600 mt-1">Total time saved</div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Emissions Chart */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Daily Emissions Reduction</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={emissions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="fuelSaved" stroke="#10b981" strokeWidth={3} name="Fuel Saved (L)" />
                                <Line type="monotone" dataKey="co2Reduced" stroke="#059669" strokeWidth={3} name="CO₂ Reduced (kg)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Routes Chart */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Daily Routes Completed</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={emissions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Legend />
                                <Bar dataKey="routes" fill="#3b82f6" name="Routes Completed" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trucks List */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Fleet Status</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trucks.map((truck) => (
                            <div key={truck.truckId} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-bold text-lg">{truck.registrationNumber}</div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${truck.status === 'active' ? 'bg-green-100 text-green-700' :
                                            truck.status === 'idle' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {truck.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span>{truck.driverName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs">
                                            {truck.currentLocation.latitude.toFixed(4)}, {truck.currentLocation.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Capacity: {truck.fuelCapacity}L</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
