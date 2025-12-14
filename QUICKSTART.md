# 🚀 Quick Start - TripMate Backend

## Start Everything (3 Commands)

```bash
# Terminal 1: Start MongoDB
brew services start mongodb-community

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start React Native
npm start
```

## Test It Works

```bash
# Check backend health
curl http://localhost:5000/api/health

# Expected: {"status":"OK","message":"TripMate API is running"}
```

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start with auto-reload
npm start           # Start production mode

# Frontend  
npm start           # Start Expo
npm run ios         # iOS simulator
npm run android     # Android emulator

# MongoDB
brew services start mongodb-community    # Start
brew services stop mongodb-community     # Stop
brew services restart mongodb-community  # Restart
```

## File Locations

```
✅ Backend API:    backend/server.js
✅ API Service:    src/services/api.js
✅ Login Screen:   src/screens/LoginScreen.js
✅ Signup Screen:  src/screens/SignupScreen.js
✅ Database:       MongoDB @ localhost:27017/tripmate
```

## What Changed

- ❌ Removed Apple Sign-In from Login & Signup
- ✅ Added Express.js backend with MongoDB
- ✅ JWT authentication working
- ✅ Form validation on both ends
- ✅ Error messages and loading states
- ✅ Token storage in AsyncStorage

## Default Test User

After first registration, you can use:
- Email: (whatever you registered)
- Password: (whatever you set)

## Troubleshooting

**MongoDB not running?**
```bash
brew services start mongodb-community
```

**Backend won't start?**
```bash
cd backend
cat .env  # Check environment variables
npm install  # Reinstall dependencies
```

**Can't connect from app?**
- iOS Simulator: `http://localhost:5000/api`
- Android Emulator: `http://10.0.2.2:5000/api`
- Real Device: `http://YOUR_IP:5000/api`

Update in: `src/services/api.js`

## Documentation

📖 Full Backend Docs: `backend/README.md`
📖 Setup Guide: `BACKEND_SETUP.md`
📖 Integration Details: `BACKEND_INTEGRATION.md`

---

**You're all set! Happy coding! 🎉**
