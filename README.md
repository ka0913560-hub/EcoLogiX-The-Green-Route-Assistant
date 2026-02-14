# EcoLogiX – The Green Route Assistant

AI-powered route optimization SaaS for delivery trucks that reduces fuel consumption, minimizes carbon emissions, and saves time.

## 🌟 Features

- **Live GPS Tracking** - Real-time truck location updates with dynamic route recalculation
- **Smart Route Optimization** - Multi-factor AI engine considering traffic, weather, and ML predictions
- **Predictive Congestion Model** - Linear regression ML model predicting traffic 30 minutes ahead
- **Driver Alert System** - Real-time notifications with fuel/time savings calculations
- **Emission Dashboard** - Track fuel saved, CO₂ reduced, and time saved with visual charts
- **Admin Fleet Management** - Overview of all trucks with aggregate analytics

## 🏗️ Architecture

```
ecologix/
├── backend/          # Node.js/Express API + Socket.io
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   ├── routes/         # REST API endpoints
│   │   ├── sockets/        # WebSocket handlers
│   │   └── server.ts       # Main server
│   └── package.json
│
├── frontend/         # Next.js 14 App
│   ├── app/
│   │   ├── driver/         # Driver dashboard
│   │   ├── admin/          # Admin dashboard
│   │   ├── services/       # API client
│   │   ├── hooks/          # React hooks
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── docs/            # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone and navigate to project**
   ```bash
   cd ecologix
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

4. **Access the Application**
   - Landing Page: http://localhost:3000
   - Driver Dashboard: http://localhost:3000/driver
   - Admin Dashboard: http://localhost:3000/admin

## 📡 API Endpoints

### Trucks
- `GET /api/trucks` - Get all trucks
- `GET /api/trucks/:id` - Get truck by ID
- `POST /api/trucks` - Create new truck
- `PUT /api/trucks/:id` - Update truck

### Routes
- `POST /api/routes` - Create and optimize route
- `GET /api/routes/:id` - Get route details
- `POST /api/routes/:id/optimize` - Trigger recalculation
- `GET /api/routes/:id/traffic` - Get live traffic data

### Analytics
- `GET /api/analytics/fleet` - Fleet-wide metrics
- `GET /api/analytics/truck/:id` - Truck-specific analytics
- `GET /api/analytics/predictions` - ML congestion predictions
- `GET /api/analytics/emissions` - Emission reports

### WebSocket Events
- `route:start` - Start GPS tracking
- `position:updated` - Real-time position broadcasts
- `route:optimized` - New optimized route available
- `alert:new` - Driver alert notification

## 🧠 Core Algorithms

### Route Optimization
Multi-factor scoring system:
- Traffic congestion: 40% weight
- Weather impact: 20% weight
- Distance efficiency: 25% weight  
- ML predictions: 15% weight

### Fuel Calculation
```
fuel = distance × 0.3 L/km × (1 + traffic × 1.5) × (1 + weather × 0.4)
CO₂ = fuel × 2.68 kg/L
```

### ML Congestion Predictor
Simple linear regression:
```
congestion = β₀ + β₁(hour) + β₂(dayOfWeek) + β₃(segment)
```

Predicts traffic 30 minutes ahead using historical patterns.

## 🗄️ Database Schema

### Truck Model
- truckId, registrationNumber, driverName
- currentLocation (lat, lng, timestamp)
- status, activeRouteId, fuelCapacity

### Route Model
- routeId, truckId, origin, destination, waypoints
- status, metrics (fuel, CO₂, time saved)
- trafficData, recalculations history

### Analytics Model
- date, truckId, daily metrics
- totalRoutes, fuelSaved, CO₂Reduced
- hourly breakdown

## 🎨 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Leaflet (Maps)
- Recharts (Analytics)
- Socket.io Client

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.io
- Mock APIs (traffic, weather)

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Set environment variables in platform
# Deploy using Git integration
```

### MongoDB
- Use MongoDB Atlas for cloud hosting
- Update `.env` with connection string

## 🔧 Configuration

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017/ecologix
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📝 Usage

1. **Create a Truck**
   - Use API or demo truck will be auto-created

2. **Start a Route**
   - Go to Driver Dashboard
   - Click "Start Route" button
   - Watch live GPS tracking

3. **Monitor Fleet**
   - Go to Admin Dashboard
   - View all trucks and aggregate metrics
   - Analyze emissions charts

4. **Real-time Updates**
   - Position updates every 5 seconds
   - Route recalculation when traffic changes >30%
   - Driver alerts for fuel-saving opportunities

## 🤝 Contributing

This is an MVP prototype. For production:
- Replace mock APIs with real services (Google Maps, OpenWeatherMap)
- Enhance ML model with TensorFlow.js
- Add authentication and authorization
- Implement proper error handling
- Add comprehensive testing

## 📄 License

MIT License

## 🌱 MVP Status

This is a working MVP demonstrating:
✅ Real-time GPS tracking simulation  
✅ Route optimization with multi-factor scoring  
✅ ML-based congestion prediction  
✅ Driver alerts and emission tracking  
✅ Fleet management dashboard  
✅ WebSocket real-time updates  
✅ Modern, responsive UI with glassmorphism  

**Not Production Ready** - Uses simulated data for traffic, weather, and GPS. Replace with real APIs for production deployment.

---

Built with 💚 for a greener future
