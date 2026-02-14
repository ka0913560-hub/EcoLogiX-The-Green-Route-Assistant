import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import trucksRouter from './routes/trucks';
import routesRouter from './routes/routes';
import analyticsRouter from './routes/analytics';

// Import socket handlers
import { setupSocketHandlers } from './sockets';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

const allowedOrigins = [
    'http://localhost:3000',
    'https://ecologix-the-green-route-assistant.vercel.app'
];

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecologix';

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        service: 'EcoLogiX Backend'
    });
});

// API Routes
app.use('/api/trucks', trucksRouter);
app.use('/api/routes', routesRouter);
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// Database connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        // Start server
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔌 WebSocket server ready`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        mongoose.connection.close();
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
