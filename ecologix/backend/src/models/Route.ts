import mongoose, { Schema, Document } from 'mongoose';
import { Location, RouteMetrics, TrafficSegment, RouteRecalculation } from '../types';

export interface IRoute extends Document {
    routeId: string;
    truckId: string;
    origin: Location & { address: string };
    destination: Location & { address: string };
    waypoints: Location[];
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    metrics: RouteMetrics;
    trafficData: TrafficSegment[];
    recalculations: RouteRecalculation[];
    createdAt: Date;
    completedAt?: Date;
}

const RouteSchema = new Schema<IRoute>(
    {
        routeId: { type: String, required: true, unique: true },
        truckId: { type: String, required: true },
        origin: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            address: { type: String, required: true }
        },
        destination: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            address: { type: String, required: true }
        },
        waypoints: [{
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        }],
        status: {
            type: String,
            enum: ['planned', 'active', 'completed', 'cancelled'],
            default: 'planned'
        },
        metrics: {
            totalDistance: { type: Number, default: 0 },
            estimatedDuration: { type: Number, default: 0 },
            actualDuration: { type: Number, default: 0 },
            fuelUsed: { type: Number, default: 0 },
            fuelSaved: { type: Number, default: 0 },
            co2Emitted: { type: Number, default: 0 },
            co2Reduced: { type: Number, default: 0 },
            timeSaved: { type: Number, default: 0 }
        },
        trafficData: [{
            segmentId: String,
            congestionLevel: Number,
            timestamp: Date
        }],
        recalculations: [{
            timestamp: Date,
            reason: String,
            newRoute: [{
                latitude: Number,
                longitude: Number
            }],
            expectedSavings: {
                fuel: Number,
                time: Number
            }
        }],
        completedAt: { type: Date }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IRoute>('Route', RouteSchema);
