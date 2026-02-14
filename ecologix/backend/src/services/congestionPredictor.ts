import { getTimeSegment } from '../utils/helpers';

/**
 * Historical traffic data point
 */
interface HistoricalData {
    hour: number; // 0-23
    dayOfWeek: number; // 0-6 (0 = Sunday)
    segmentId: string;
    congestion: number; // 0-1
}

/**
 * Trained model coefficients
 */
interface ModelWeights {
    beta0: number; // intercept
    beta1: number; // hour coefficient
    beta2: number; // day coefficient
    beta3: number; // segment coefficient
}

/**
 * Congestion Predictor - Simple Linear Regression ML Model
 * Predicts traffic congestion 30 minutes ahead
 */
class CongestionPredictor {
    private model: ModelWeights | null = null;
    private historicalData: HistoricalData[] = [];

    constructor() {
        this.generateHistoricalData();
        this.trainModel();
    }

    /**
     * Generate simulated historical traffic data
     */
    private generateHistoricalData(): void {
        const segments = ['seg_0', 'seg_1', 'seg_2', 'seg_3', 'seg_4'];

        // Generate 2 weeks of hourly data
        for (let day = 0; day < 14; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const dayOfWeek = day % 7;

                segments.forEach(segmentId => {
                    // Base congestion varies by time
                    let baseCongestion = 0.2;

                    // Rush hours
                    if (hour >= 8 && hour <= 10) baseCongestion = 0.7;
                    else if (hour >= 18 && hour <= 20) baseCongestion = 0.75;
                    else if (hour >= 22 || hour <= 6) baseCongestion = 0.1;

                    // Weekends are less congested
                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        baseCongestion *= 0.6;
                    }

                    // Add some randomness
                    const congestion = Math.min(0.95, Math.max(0.05,
                        baseCongestion + (Math.random() - 0.5) * 0.2
                    ));

                    this.historicalData.push({
                        hour,
                        dayOfWeek,
                        segmentId,
                        congestion
                    });
                });
            }
        }
    }

    /**
     * Train linear regression model using least squares
     */
    private trainModel(): void {
        const n = this.historicalData.length;

        // Calculate means
        let sumHour = 0, sumDay = 0, sumCongestion = 0;
        this.historicalData.forEach(d => {
            sumHour += d.hour;
            sumDay += d.dayOfWeek;
            sumCongestion += d.congestion;
        });

        const meanHour = sumHour / n;
        const meanDay = sumDay / n;
        const meanCongestion = sumCongestion / n;

        // Calculate coefficients using simplified least squares
        // For simplicity, we'll use basic linear relationships
        let sumHourCong = 0, sumDayCong = 0, sumHourSq = 0, sumDaySq = 0;

        this.historicalData.forEach(d => {
            sumHourCong += (d.hour - meanHour) * (d.congestion - meanCongestion);
            sumDayCong += (d.dayOfWeek - meanDay) * (d.congestion - meanCongestion);
            sumHourSq += Math.pow(d.hour - meanHour, 2);
            sumDaySq += Math.pow(d.dayOfWeek - meanDay, 2);
        });

        const beta1 = sumHourSq !== 0 ? sumHourCong / sumHourSq : 0;
        const beta2 = sumDaySq !== 0 ? sumDayCong / sumDaySq : 0;
        const beta3 = 0.05; // Simple segment coefficient
        const beta0 = meanCongestion - (beta1 * meanHour) - (beta2 * meanDay);

        this.model = { beta0, beta1, beta2, beta3 };
    }

    /**
     * Predict congestion 30 minutes ahead
     */
    predictCongestion(segmentId: string): number {
        if (!this.model) {
            return 0.5; // Default prediction
        }

        const now = new Date();
        const futureTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes ahead

        const hour = futureTime.getHours();
        const dayOfWeek = futureTime.getDay();
        const segmentFactor = parseInt(segmentId.split('_')[1] || '0') * 0.01;

        // Linear regression formula: congestion = β₀ + β₁(hour) + β₂(day) + β₃(segment)
        let prediction = this.model.beta0 +
            (this.model.beta1 * hour) +
            (this.model.beta2 * dayOfWeek) +
            (this.model.beta3 * segmentFactor);

        // Clamp to valid range
        prediction = Math.max(0, Math.min(1, prediction));

        return Math.round(prediction * 100) / 100;
    }

    /**
     * Get prediction accuracy (comparing with current actual data)
     */
    getPredictionAccuracy(): number {
        // Sample random historical points and compare predictions
        let totalError = 0;
        const sampleSize = Math.min(100, this.historicalData.length);

        for (let i = 0; i < sampleSize; i++) {
            const sample = this.historicalData[Math.floor(Math.random() * this.historicalData.length)];

            if (!this.model) continue;

            const prediction = this.model.beta0 +
                (this.model.beta1 * sample.hour) +
                (this.model.beta2 * sample.dayOfWeek);

            const error = Math.abs(prediction - sample.congestion);
            totalError += error;
        }

        const meanError = totalError / sampleSize;
        const accuracy = (1 - meanError) * 100;

        return Math.round(accuracy * 100) / 100;
    }

    /**
     * Get model information
     */
    getModelInfo(): { weights: ModelWeights; accuracy: number; dataPoints: number } {
        return {
            weights: this.model || { beta0: 0, beta1: 0, beta2: 0, beta3: 0 },
            accuracy: this.getPredictionAccuracy(),
            dataPoints: this.historicalData.length
        };
    }
}

export default new CongestionPredictor();
