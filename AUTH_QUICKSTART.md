# 🚀 Quick Start Guide - Authentication & Profile System

## ✅ What's Complete

Your TripMate app now has a fully functional authentication system with dynamic profile management!

### Features Implemented:
- ✅ User Registration & Login
- ✅ JWT Authentication with token persistence
- ✅ Dynamic Profile Screen (shows login/signup when not authenticated)
- ✅ Profile Editing with image upload
- ✅ Cloudinary integration for avatars
- ✅ Logout functionality
- ✅ Global authentication state management

## 🏃 Getting Started (3 Steps)

### Step 1: Configure Cloudinary (Required for image uploads)

1. Go to [cloudinary.com](https://cloudinary.com/) and sign up
2. From your Dashboard, get your **Cloud Name**
3. Go to Settings → Upload → Create an **Upload Preset** (set as "Unsigned")
4. Open `src/services/imageUpload.js` and update:
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
   const CLOUDINARY_UPLOAD_PRESET = 'your_preset_name';
   ```

📖 **Detailed instructions**: See `CLOUDINARY_SETUP.md`

### Step 2: Start the Backend

```bash
cd backend
node server.js
```

✅ Backend should start on **http://localhost:5001**

### Step 3: Start the App

```bash
# In the project root
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code for physical device

## 🧪 Test the Complete Flow

### Test 1: Unauthenticated Profile
1. Open app → Tap Profile tab (bottom right)
2. ✅ Should see "Join TripMate" screen with Create Account/Sign In buttons

### Test 2: Sign Up
1. Tap "Create Account"
2. Fill in: Full Name, Email, Password, Confirm Password
3. Check "I agree to Terms & Privacy Policy"
4. Tap "Sign Up"
5. ✅ Should create account and navigate to Main tabs
6. ✅ Profile tab should now show your profile with your data

### Test 3: Edit Profile
1. In Profile tab, tap "Edit Profile" button
2. Tap the camera icon to upload avatar
3. Edit name, bio, or location
4. Tap "Save Changes"
5. ✅ Profile should update with new information

### Test 4: Logout & Login
1. From Profile, tap Settings icon (top right)
2. Scroll down and tap "Logout"
3. Confirm logout
4. ✅ Should return to GetStarted screen
5. Tap "Sign In", enter credentials
6. ✅ Should login and see your profile data

### Test 5: Persistence
1. Login to your account
2. Close the app completely
3. Reopen the app
4. ✅ Should still be logged in (no need to login again)

## 📱 User Flow

```
Not Logged In:
GetStarted → Login/Signup → Main Tabs → Profile (Dynamic)

Logged In:
Main Tabs → Profile → Edit Profile → Upload Avatar → Save
                    → Settings → Logout
```

## 🔧 Troubleshooting

### "Cannot connect to backend"
- ✅ Check backend is running: `cd backend && node server.js`
- ✅ Check terminal shows: "Server running on port 5001"
- ✅ Check MongoDB connection is successful

### "Image upload failed"
- ✅ Configure Cloudinary credentials in `src/services/imageUpload.js`
- ✅ Make sure upload preset is set to "Unsigned"
- ✅ Check internet connection

### "Not logged in after signup/login"
- ✅ Check browser console/terminal for errors
- ✅ Make sure backend returned token in response
- ✅ Check AsyncStorage is working (might need to clear app data)

### "App crashes on Profile screen"
- ✅ Make sure AuthProvider wraps the app (check `App.js`)
- ✅ Check all imports are correct
- ✅ Clear Metro bundler cache: `npm start -- --reset-cache`

## 🏗️ Architecture Overview

```
App.js
├── ThemeProvider (manages dark/light theme)
└── AuthProvider (manages authentication state)
    └── Navigation
        ├── Auth Screens
        │   ├── GetStarted
        │   ├── Login (updates auth)
        │   └── Signup (updates auth)
        └── Main Tabs
            ├── Home
            ├── Explore
            ├── Create
            ├── Notifications
            └── Profile (auth-aware)
                ├── Shows login/signup if not authenticated
                ├── Shows dynamic profile if authenticated
                └── EditProfile (with Cloudinary upload)
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.js` | Global auth state |
| `src/services/api.js` | Backend API client |
| `src/services/imageUpload.js` | Cloudinary upload ⚠️ NEEDS CONFIG |
| `src/screens/ProfileScreen.js` | Auth-aware profile |
| `src/screens/EditProfileScreen.js` | Profile editor |
| `src/screens/LoginScreen.js` | Login with backend |
| `src/screens/SignupScreen.js` | Signup with backend |
| `src/screens/SettingsScreen.js` | Logout & settings |
| `backend/server.js` | Express backend |

## 🔑 Environment Variables

### Backend (.env file in `backend/` folder)
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend (in code)
```javascript
// src/services/api.js
const API_URL = 'http://localhost:5001/api';

// src/services/imageUpload.js (NEEDS UPDATE)
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';
```

## 📚 Additional Documentation

- **CLOUDINARY_SETUP.md** - Detailed Cloudinary configuration
- **PROFILE_IMPLEMENTATION.md** - Technical implementation details
- **PROJECT_SUMMARY.md** - Overall project documentation
- **SETUP.md** - Initial project setup

## 🎯 Next Steps (Optional)

1. **Add Google Sign-In** - Implement OAuth for Google login
2. **Make trips dynamic** - Fetch user trips from backend
3. **Add followers/following** - Implement social features
4. **Password reset** - Add forgot password flow
5. **Profile completion** - Show profile completion percentage
6. **Image optimization** - Add Cloudinary transformations

## 💡 Tips

- **Development**: Use `console.log()` in screens to debug auth state
- **Token Debugging**: Check AsyncStorage in React Native Debugger
- **API Testing**: Use Postman to test backend endpoints independently
- **Cloudinary Free Tier**: 25GB storage, enough for development

## 🆘 Need Help?

Check these files for more info:
- `CLOUDINARY_SETUP.md` - Image upload setup
- `PROFILE_IMPLEMENTATION.md` - Technical details
- Backend `README.md` - API documentation

---

**Ready to go!** 🎉

1. Configure Cloudinary
2. Start backend: `cd backend && node server.js`
3. Start app: `npm start`
4. Test the complete authentication flow

Everything should work seamlessly! 🚀
