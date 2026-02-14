import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
    date: Date;
    truckId?: string; // null for fleet-wide
    metrics: {
        totalRoutes: number;
        totalDistance: number;
        totalFuelUsed: number;
        totalFuelSaved: number;
        totalCO2Reduced: number;
        totalTimeSaved: number;
    };
    hourlyBreakdown: Array<{
        hour: number;
        routes: number;
        fuelSaved: number;
    }>;
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        date: { type: Date, required: true },
        truckId: { type: String },
        metrics: {
            totalRoutes: { type: Number, default: 0 },
            totalDistance: { type: Number, default: 0 },
            totalFuelUsed: { type: Number, default: 0 },
            totalFuelSaved: { type: Number, default: 0 },
            totalCO2Reduced: { type: Number, default: 0 },
            totalTimeSaved: { type: Number, default: 0 }
        },
        hourlyBreakdown: [{
            hour: { type: Number, min: 0, max: 23 },
            routes: { type: Number, default: 0 },
            fuelSaved: { type: Number, default: 0 }
        }]
    },
    {
        timestamps: true
    }
);

// Index for efficient querying
AnalyticsSchema.index({ date: 1, truckId: 1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
