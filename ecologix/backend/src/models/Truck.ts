import mongoose, { Schema, Document } from 'mongoose';
import { Location } from '../types';

export interface ITruck extends Document {
    truckId: string;
    registrationNumber: string;
    driverName: string;
    currentLocation: Location;
    status: 'active' | 'idle' | 'offline';
    activeRouteId?: string;
    fuelCapacity: number;
    averageConsumption: number;
    createdAt: Date;
    updatedAt: Date;
}

const TruckSchema = new Schema<ITruck>(
    {
        truckId: { type: String, required: true, unique: true },
        registrationNumber: { type: String, required: true },
        driverName: { type: String, required: true },
        currentLocation: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            timestamp: { type: Date, default: Date.now }
        },
        status: {
            type: String,
            enum: ['active', 'idle', 'offline'],
            default: 'idle'
        },
        activeRouteId: { type: String },
        fuelCapacity: { type: Number, required: true, default: 300 }, // liters
        averageConsumption: { type: Number, required: true, default: 0.3 } // L/km
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITruck>('Truck', TruckSchema);
