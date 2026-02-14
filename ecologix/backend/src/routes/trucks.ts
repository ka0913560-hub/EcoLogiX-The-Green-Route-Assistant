import { Router, Request, Response } from 'express';
import Truck from '../models/Truck';
import { generateId } from '../utils/helpers';

const router = Router();

/**
 * GET /api/trucks - Get all trucks
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const trucks = await Truck.find();
        res.json({ success: true, data: trucks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch trucks' });
    }
});

/**
 * GET /api/trucks/:id - Get truck by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const truck = await Truck.findOne({ truckId: req.params.id });
        if (!truck) {
            return res.status(404).json({ success: false, error: 'Truck not found' });
        }
        res.json({ success: true, data: truck });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch truck' });
    }
});

/**
 * POST /api/trucks - Create new truck
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { registrationNumber, driverName, fuelCapacity, averageConsumption } = req.body;

        const truck = new Truck({
            truckId: generateId('truck'),
            registrationNumber,
            driverName,
            currentLocation: {
                latitude: 28.6139, // Default to Delhi
                longitude: 77.2090,
                timestamp: new Date()
            },
            status: 'idle',
            fuelCapacity: fuelCapacity || 300,
            averageConsumption: averageConsumption || 0.3
        });

        await truck.save();
        res.status(201).json({ success: true, data: truck });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create truck' });
    }
});

/**
 * PUT /api/trucks/:id - Update truck
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const truck = await Truck.findOneAndUpdate(
            { truckId: req.params.id },
            req.body,
            { new: true }
        );

        if (!truck) {
            return res.status(404).json({ success: false, error: 'Truck not found' });
        }

        res.json({ success: true, data: truck });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update truck' });
    }
});

/**
 * GET /api/trucks/:id/location - Get current location
 */
router.get('/:id/location', async (req: Request, res: Response) => {
    try {
        const truck = await Truck.findOne({ truckId: req.params.id });
        if (!truck) {
            return res.status(404).json({ success: false, error: 'Truck not found' });
        }
        res.json({ success: true, data: truck.currentLocation });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch location' });
    }
});

export default router;
