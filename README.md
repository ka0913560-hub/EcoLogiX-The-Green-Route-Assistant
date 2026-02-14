# 🌿 EcoLogiX – The Green Route Assistant

AI-powered real-time route optimization system that reduces fuel consumption, minimizes carbon emissions, and dynamically reroutes delivery trucks while they are moving.

---

## 🚛 Problem

Delivery trucks in India waste large amounts of fuel due to:

- Traffic congestion
- Idle engine time
- Static route planning
- No predictive traffic intelligence

This leads to:
- Increased logistics cost
- Higher CO₂ emissions
- Delivery delays

---

## 💡 Solution

EcoLogiX is a smart “Green Route Assistant” that:

- Tracks live truck GPS
- Continuously recalculates eco-efficient routes
- Predicts congestion 30 minutes ahead
- Alerts drivers in real-time
- Tracks fuel savings and emission reduction

Unlike traditional navigation systems, EcoLogiX optimizes for **fuel efficiency and emissions**, not just speed.

---

## 🔥 Core Features

### 🚦 Live GPS Tracking
- Simulated real-time truck movement
- Dynamic route recalculation
- WebSocket-based live updates

### 🧠 Smart Route Optimization Engine
Multi-factor scoring system based on:
- Traffic density
- Weather impact
- Distance efficiency
- ML congestion prediction

### 🔔 Driver Alert System
Real-time alerts such as:
“Turn left in 200m to save 1.2L fuel and 14 minutes.”

### 📊 Emission Dashboard
- Fuel Saved (Liters)
- CO₂ Reduced (kg)
- Time Saved (minutes)
- Fleet-wide analytics

### 🏢 Admin Fleet Panel
- Monitor all trucks
- View route history
- Track performance metrics

---

## 🏗️ System Architecture

Frontend (Next.js + Leaflet + Socket.io)  
↓  
Backend (Node.js + Express + WebSocket)  
↓  
MongoDB (Truck + Route + Analytics Models)  
↓  
Optimization Engine (Traffic + Weather + ML Predictor)

---

## 🧠 Core Algorithms

### Route Scoring Formula

score =  
(traffic × 0.4) +  
(weather × 0.2) +  
(distance × 0.25) +  
(ml_prediction × 0.15)

Lower score = More eco-efficient route

---

### Fuel Calculation

fuel = distance × 0.3 L/km × (1 + traffic × 1.5) × (1 + weather × 0.4)

CO₂ = fuel × 2.68 kg/L

---

### ML Congestion Predictor

Linear Regression Model:

congestion = β₀ + β₁(hour) + β₂(dayOfWeek) + β₃(roadSegment)

Predicts traffic 30 minutes ahead using historical simulation data.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn


---

## 📡 API Endpoints

### Trucks
GET /api/trucks  
POST /api/trucks  

### Routes
POST /api/routes  
POST /api/routes/:id/optimize  

### Analytics
GET /api/analytics/fleet  
GET /api/analytics/predictions  

### WebSocket Events
route:start  
position:updated  
route:optimized  
alert:new  

---

## 🌍 Tech Stack

Frontend:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet
- Recharts
- Socket.io Client

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.io

---


## 🌱 MVP Status

✔ Real-time GPS simulation  
✔ Dynamic route recalculation  
✔ Predictive congestion logic  
✔ Emission tracking  
✔ Fleet analytics  
✔ WebSocket live updates  

Note: Uses simulated traffic and weather data. Replace with real APIs for production.

---

## 💚 Vision

EcoLogiX aims to reduce logistics carbon footprint by making every delivery smarter, faster, and greener.
