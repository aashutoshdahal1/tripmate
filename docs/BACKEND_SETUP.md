# TripMate Backend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running
- npm or yarn

### 1. Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Check if MongoDB is running:**
```bash
brew services list | grep mongodb
# Should show: mongodb-community started
```

### 2. Start Backend Server

```bash
cd backend
npm install  # Already done!
npm run dev  # Development with auto-reload
# OR
npm start    # Production mode
```

Server will start on: **http://localhost:5000**

### 3. Update Frontend API URL

If testing on a real device or emulator, update the API_URL in:
`src/services/api.js`

**For iOS Simulator:**
```javascript
const API_URL = 'http://localhost:5000/api';
```

**For Android Emulator:**
```javascript
const API_URL = 'http://10.0.2.2:5000/api';
```

**For Real Device (same WiFi):**
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
// Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 4. Start React Native App

In a new terminal:
```bash
cd ..  # Back to project root
npm start
```

Press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code for Expo Go on real device

---

## 🧪 Testing the API

### 1. Test Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"OK","message":"TripMate API is running"}
```

### 2. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from response!

### 4. Test Get Profile
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📱 Using in the App

### Sign Up Flow
1. Open app
2. Tap "Create Account" on GetStarted screen
3. Fill in: Full Name, Email, Password, Confirm Password
4. Check "Terms & Privacy" checkbox
5. Tap "Create Account"
6. ✅ Account created! Redirects to Main app

### Login Flow
1. Open app
2. Tap "Sign In" on GetStarted screen
3. Enter Email and Password
4. Tap "Sign In"
5. ✅ Logged in! Redirects to Main app

### Features
- ✅ Real authentication with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Token stored securely in AsyncStorage
- ✅ Form validation on both frontend and backend
- ✅ Error messages displayed to user
- ✅ Loading states during API calls
- ❌ Apple Sign-In removed (as requested)
- ⏳ Google Sign-In placeholder (coming soon)

---

## 🛠️ Troubleshooting

### MongoDB not running?
```bash
# macOS
brew services start mongodb-community

# Check status
brew services list

# View logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Port 5000 already in use?
Change PORT in `backend/.env`:
```
PORT=5001
```

Then update `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:5001/api';
```

### Can't connect from React Native?
1. Make sure backend is running
2. Check firewall settings
3. Use correct IP address for device
4. Both devices on same WiFi network

### Backend crashes?
Check logs:
```bash
cd backend
npm run dev
# Watch for error messages
```

Common issues:
- MongoDB not running
- Port already in use
- Missing environment variables

---

## 📝 Environment Variables

Located in `backend/.env`:

```env
PORT=5000                                    # Server port
MONGODB_URI=mongodb://localhost:27017/tripmate  # Database URL
JWT_SECRET=tripmate_super_secret_key_2025_change_this_in_production  # Change in production!
JWT_EXPIRE=7d                                # Token expiration
NODE_ENV=development                         # Environment mode
```

**⚠️ Important:** Change `JWT_SECRET` before deploying to production!

---

## 🎯 What's Working

### Backend (Express.js)
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing
- ✅ Protected routes
- ✅ Get current user profile
- ✅ Update user profile
- ✅ Error handling
- ✅ CORS enabled

### Frontend (React Native)
- ✅ Registration form with validation
- ✅ Login form with validation
- ✅ Token storage in AsyncStorage
- ✅ Error messages
- ✅ Loading states
- ✅ Password visibility toggle
- ✅ Terms & conditions checkbox
- ✅ Navigation between auth screens
- ✅ Apple Sign-In removed
- ✅ Google Sign-In placeholder

---

## 🔄 Complete Test Flow

1. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `🚀 Server running on port 5000` and `✅ MongoDB Connected`

3. **Start Frontend:**
   ```bash
   cd ..
   npm start
   ```

4. **In App:**
   - Tap "Create Account"
   - Fill in details
   - Tap "Create Account" button
   - See success alert
   - Redirected to main app
   - Token saved in AsyncStorage

5. **Test Login:**
   - Close and reopen app
   - Tap "Sign In"
   - Enter same credentials
   - Tap "Sign In" button
   - See success alert
   - Redirected to main app

---

## 📚 API Documentation

Full API docs available in: `backend/README.md`

---

## ✅ Checklist

- [x] Backend setup complete
- [x] MongoDB connected
- [x] Registration endpoint working
- [x] Login endpoint working
- [x] JWT authentication working
- [x] Frontend forms updated
- [x] Apple Sign-In removed
- [x] Error handling implemented
- [x] Loading states added
- [x] Token storage implemented
- [ ] Google OAuth (coming soon)
- [ ] Password reset (coming soon)
- [ ] Email verification (coming soon)

---

## 🎉 You're All Set!

Your TripMate app now has a fully functional authentication system with Express.js backend and MongoDB database!

**Next Steps:**
1. Start backend server
2. Test in the app
3. Add more features (trips, posts, etc.)
4. Deploy to production

Enjoy building! 🚀
