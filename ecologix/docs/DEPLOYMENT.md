# EcoLogiX Deployment Guide

## Prerequisites

Before deploying EcoLogiX, ensure you have:
- MongoDB Atlas account (free tier available) OR local MongoDB installed
- Vercel account (for frontend) OR any Node.js hosting
- Railway/Render account (for backend) OR any Node.js hosting
- Node.js 18+ installed locally for testing

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user with password
4. Whitelist IP addresses (0.0.0.0/0 for testing, specific IPs for production)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecologix
   ```

### Option 2: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```
3. Connection string:
   ```
   mongodb://localhost:27017/ecologix
   ```

## Backend Deployment

### Option 1: Railway

1. Create account at https://railway.app
2. Create new project
3. Deploy from GitHub:
   - Connect repository
   - Select `backend` folder as root
   - Set environment variables:
     ```
     MONGODB_URI=<your-mongodb-uri>
     PORT=5000
     FRONTEND_URL=<your-frontend-url>
     NODE_ENV=production
     ```
4. Railway will auto-deploy on push

### Option 2: Render

1. Create account at https://render.com
2. Create new Web Service
3. Connect repository
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: (same as Railway)
5. Deploy

### Option 3: Manual VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd ecologix/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Build
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start dist/server.js --name ecologix-backend

# Save PM2 config
pm2 save
pm2 startup
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Create account at https://vercel.com
2. Import project from GitHub
3. Settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Environment Variables:
     ```
     NEXT_PUBLIC_API_URL=<your-backend-url>
     ```
4. Deploy
5. Vercel will auto-deploy on push to main branch

### Option 2: Netlify

1. Create account at https://netlify.com
2. New site from Git
3. Settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables: (same as Vercel)
4. Deploy

### Option 3: Static Export + Any Host

```bash
cd frontend

# Update next.config.js for static export
# Add: output: 'export'

# Build
npm run build

# Upload 'out' folder to any static host
# (Netlify, Vercel, AWS S3, GitHub Pages, etc.)
```

## Environment Variables Summary

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecologix
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
```

## Post-Deployment Checklist

- [ ] Backend health check: Visit `https://your-backend-url/health`
- [ ] MongoDB connection: Check backend logs for "Connected to MongoDB"
- [ ] Frontend loads: Visit your frontend URL
- [ ] WebSocket connection: Check browser console for "Socket connected"
- [ ] Create test truck: Use driver dashboard
- [ ] Start test route: Verify GPS tracking works
- [ ] Check analytics: Visit admin dashboard

## Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Verify all environment variables are set
- Check backend logs for errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct (include https://)
- Check CORS settings in backend allow frontend domain
- Verify backend is running and accessible

### WebSocket errors
- Ensure backend supports WebSocket (Railway/Render do)
- Check firewall rules allow WebSocket connections
- Verify Socket.io client version matches server version

### Maps not showing
- Check Leaflet CSS is loading
- Verify coordinates are valid
- Check browser console for errors

## Scaling for Production

### Backend
- Use Redis for caching traffic/weather data
- Implement database indexes for faster queries
- Use load balancer for multiple instances
- Enable rate limiting to prevent abuse

### Frontend
- Enable Next.js Image Optimization
- Use CDN for static assets
- Implement code splitting
- Add service worker for offline support

### Database
- Create indexes: `db.trucks.createIndex({ truckId: 1 })`
- Enable MongoDB replica set for high availability
- Implement connection pooling
- Regular backups

## Security Recommendations

1. **API Security**
   - Add JWT authentication
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs

2. **Database**
   - Use environment variables for credentials
   - Enable MongoDB authentication
   - Regular backups
   - Encrypt sensitive data

3. **Frontend**
   - Sanitize user inputs
   - Implement CSP headers
   - Use HTTPS
   - Regular dependency updates

## Monitoring

### Recommended Tools
- **Backend**: PM2, New Relic, Datadog
- **Database**: MongoDB Atlas monitoring
- **Frontend**: Vercel Analytics, Google Analytics
- **Errors**: Sentry, LogRocket

### Key Metrics to Monitor
- API response times
- WebSocket connection count
- Database query performance
- Error rates
- Active trucks count

## Cost Estimation (Monthly)

**Free Tier:**
- MongoDB Atlas: Free (512MB)
- Vercel: Free (100GB bandwidth)
- Railway: Free tier available
- **Total: $0-5/month**

**Production Tier:**
- MongoDB Atlas: $9-25 (Shared cluster)
- Vercel Pro: $20
- Railway: $20-50
- **Total: $50-100/month**

## Support

For issues or questions:
1. Check logs first
2. Review documentation
3. Test with local development setup
4. Check GitHub issues

---

Last updated: 2026-02-13
