import { Server as SocketIOServer, Socket } from 'socket.io';
import Truck from '../models/Truck';
import Route from '../models/Route';
import gpsSimulator from '../services/gpsSimulator';
import trafficSimulator from '../services/trafficSimulator';
import routeOptimizer from '../services/routeOptimizer';
import { generateId } from '../utils/helpers';

/**
 * WebSocket event handlers for real-time updates
 */
export function setupSocketHandlers(io: SocketIOServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        /**
         * Start route tracking
         */
        socket.on('route:start', async (data: { routeId: string }) => {
            try {
                const route = await Route.findOne({ routeId: data.routeId });
                if (!route) {
                    socket.emit('error', { message: 'Route not found' });
                    return;
                }

                // Start GPS simulation
                gpsSimulator.startSimulation(route.truckId, route.waypoints);

                // Join route room for updates
                socket.join(`route:${route.routeId}`);

                // Start position updates (every 5 seconds)
                const intervalId = setInterval(async () => {
                    const currentTraffic = trafficSimulator.getRouteTraffic(route.waypoints);
                    const newPosition = gpsSimulator.updatePosition(route.truckId, currentTraffic);

                    if (newPosition) {
                        // Update truck position in database
                        await Truck.findOneAndUpdate(
                            { truckId: route.truckId },
                            { currentLocation: newPosition }
                        );

                        // Broadcast position update
                        io.to(`route:${route.routeId}`).emit('position:updated', {
                            truckId: route.truckId,
                            position: newPosition,
                            progress: gpsSimulator.getProgress(route.truckId)
                        });

                        // Check if route recalculation needed
                        const previousTraffic = route.trafficData.length > 0 ?
                            route.trafficData[route.trafficData.length - 1].congestionLevel :
                            0.2;

                        const { shouldRecalculate, newTraffic } = routeOptimizer.shouldRecalculate(
                            route.waypoints,
                            previousTraffic
                        );

                        if (shouldRecalculate) {
                            // Recalculate route
                            const optimized = await routeOptimizer.optimizeRoute(
                                newPosition,
                                route.destination
                            );

                            // Generate alert
                            const alert = routeOptimizer.generateAlert(
                                {
                                    waypoints: route.waypoints,
                                    totalDistance: route.metrics.totalDistance,
                                    estimatedDuration: route.metrics.estimatedDuration,
                                    fuelEstimate: 0,
                                    co2Estimate: 0,
                                    trafficScore: 0,
                                    weatherScore: 0,
                                    overallScore: 0
                                },
                                optimized,
                                'Traffic increased significantly ahead'
                            );

                            // Update route
                            route.waypoints = optimized.waypoints;
                            route.recalculations.push({
                                timestamp: new Date(),
                                reason: 'Traffic congestion increased',
                                newRoute: optimized.waypoints,
                                expectedSavings: {
                                    fuel: alert.fuelSavings,
                                    time: alert.timeSavings
                                }
                            });
                            await route.save();

                            // Update GPS simulator
                            gpsSimulator.updateRoute(route.truckId, optimized.waypoints);

                            // Send alert to driver
                            io.to(`route:${route.routeId}`).emit('alert:new', {
                                id: generateId('alert'),
                                type: 'route_change',
                                message: alert.message,
                                fuelSavings: alert.fuelSavings,
                                timeSavings: alert.timeSavings,
                                timestamp: new Date()
                            });

                            // Broadcast route update
                            io.to(`route:${route.routeId}`).emit('route:optimized', {
                                routeId: route.routeId,
                                newWaypoints: optimized.waypoints,
                                optimization: optimized
                            });
                        }

                        // Update traffic data
                        route.trafficData.push({
                            segmentId: 'current',
                            congestionLevel: newTraffic,
                            timestamp: new Date()
                        });
                        await route.save();
                    }

                    // Check if route complete
                    if (gpsSimulator.isComplete(route.truckId)) {
                        clearInterval(intervalId);
                        gpsSimulator.stopSimulation(route.truckId);
                        io.to(`route:${route.routeId}`).emit('route:completed', {
                            routeId: route.routeId
                        });
                    }
                }, 5000);

                // Store interval ID on socket for cleanup
                (socket as any).routeInterval = intervalId;

                socket.emit('route:started', { routeId: route.routeId });
            } catch (error) {
                console.error('Route start error:', error);
                socket.emit('error', { message: 'Failed to start route' });
            }
        });

        /**
         * Acknowledge alert
         */
        socket.on('alert:acknowledge', (data: { alertId: string }) => {
            console.log(`Alert ${data.alertId} acknowledged`);
        });

        /**
         * Request manual route optimization
         */
        socket.on('route:optimize:request', async (data: { routeId: string; currentPosition: any }) => {
            try {
                const route = await Route.findOne({ routeId: data.routeId });
                if (!route) {
                    socket.emit('error', { message: 'Route not found' });
                    return;
                }

                const optimized = await routeOptimizer.optimizeRoute(
                    data.currentPosition,
                    route.destination
                );

                socket.emit('route:optimized', {
                    routeId: route.routeId,
                    newWaypoints: optimized.waypoints,
                    optimization: optimized
                });
            } catch (error) {
                socket.emit('error', { message: 'Failed to optimize route' });
            }
        });

        /**
         * Get live traffic updates
         */
        socket.on('traffic:subscribe', (data: { routeId: string }) => {
            socket.join(`traffic:${data.routeId}`);

            // Send traffic updates every 30 seconds
            const trafficInterval = setInterval(async () => {
                const route = await Route.findOne({ routeId: data.routeId });
                if (route) {
                    const traffic = trafficSimulator.getRouteTraffic(route.waypoints);
                    socket.emit('traffic:updated', {
                        routeId: data.routeId,
                        averageTraffic: traffic,
                        timestamp: new Date()
                    });
                }
            }, 30000);

            (socket as any).trafficInterval = trafficInterval;
        });

        /**
         * Disconnect cleanup
         */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);

            // Clear intervals
            if ((socket as any).routeInterval) {
                clearInterval((socket as any).routeInterval);
            }
            if ((socket as any).trafficInterval) {
                clearInterval((socket as any).trafficInterval);
            }
        });
    });
}
