# TripVibe Mobile App - Setup & Installation Guide

## 🚀 Quick Start

Follow these steps to get the TripVibe mobile app running on your device.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally:
  ```bash
  npm install -g expo-cli
  ```

### For iOS Development (Mac only)
- **Xcode** - Install from Mac App Store
- **iOS Simulator** - Included with Xcode

### For Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** and **Emulator** - Set up through Android Studio

### For Testing on Physical Device
- **Expo Go** app on your iPhone or Android device
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation Steps

### 1. Navigate to Project Directory
```bash
cd /Users/aashutoshdahal/Desktop/TravelMate/TripMate
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React Navigation (navigation)
- Expo AV (video playback)
- Expo Linear Gradient (gradients)
- React Native Gesture Handler (gestures)
- React Native Reanimated (animations)
- AsyncStorage (local storage)
- Vector Icons

### 3. Start the Development Server
```bash
npm start
```
or
```bash
expo start
```

### 4. Run the App

#### Option A: iOS Simulator (Mac only)
1. Press `i` in the terminal, or
2. Click "Run on iOS Simulator" in Expo Dev Tools

#### Option B: Android Emulator
1. Make sure Android emulator is running
2. Press `a` in the terminal, or
3. Click "Run on Android device/emulator" in Expo Dev Tools

#### Option C: Physical Device
1. Open Expo Go app on your phone
2. Scan the QR code shown in the terminal or browser
3. Wait for the app to load

## 🔧 Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start --clear
```

#### 2. "Unable to resolve module" for Reanimated
Make sure `babel.config.js` includes the reanimated plugin:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

#### 3. iOS Build Issues
```bash
# Clean iOS build
cd ios
pod install
cd ..
```

#### 4. Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

#### 5. Expo CLI not found
```bash
# Install Expo CLI globally
npm install -g expo-cli
```

## 📱 Development Tips

### Hot Reload
- Press `r` in terminal to reload the app
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu

### Debug Menu
- **iOS**: `Cmd + D`
- **Android**: `Cmd + M` or shake device
- **Physical Device**: Shake your device

### Useful Commands
```bash
# Start with clear cache
npm start --clear

# Start on specific platform
npm run ios
npm run android

# Run in production mode
npm start --no-dev --minify
```

## 🎨 Project Structure Explained

```
TripMate/
├── App.js                      # App entry point with navigation setup
├── babel.config.js             # Babel configuration for Reanimated
├── package.json                # Dependencies and scripts
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Button.js          # Custom button with variants & gradients
│   │   └── VideoCard.js       # Video preview card component
│   │
│   ├── constants/
│   │   └── colors.js          # Theme colors, spacing, fonts, shadows
│   │
│   ├── contexts/
│   │   └── ThemeContext.js    # Dark mode & theme management
│   │
│   ├── navigation/
│   │   └── AppNavigator.js    # Stack & Tab navigation setup
│   │
│   └── screens/               # All app screens
│       ├── HomePage.js        # Home feed with videos
│       ├── VideoWatchPage.js  # Full-screen video player
│       ├── ItineraryPage.js   # Itinerary details
│       ├── ExplorePage.js     # Search and explore
│       ├── UploadPage.js      # Video upload wizard
│       ├── ProfilePage.js     # User profile
│       ├── LoginPage.js       # Login screen
│       ├── SignupPage.js      # Sign up screen
│       └── SettingsPage.js    # Settings page
```

## 🔑 Key Features to Test

1. **Dark Mode Toggle**
   - Go to Settings → Toggle Dark Mode
   - Theme should persist after app restart

2. **Video Feed**
   - Scroll through videos on Home screen
   - Tap video card to open full-screen player

3. **Video Player**
   - Full-screen vertical video
   - Tap "View Itinerary" button
   - Swipe down to dismiss itinerary

4. **Navigation**
   - Bottom tabs: Home, Explore, Upload, Profile
   - Back navigation with header buttons

5. **Explore**
   - Search destinations
   - Filter by categories
   - Grid view of destinations

6. **Upload Flow**
   - 4-step wizard with progress indicator
   - Form validation
   - Navigation between steps

7. **Profile**
   - View stats and travel achievements
   - Tab navigation: Videos, Itineraries, Saved
   - Edit profile button

## 🌟 Next Steps

After successful setup:

1. **Customize Branding**
   - Update colors in `src/constants/colors.js`
   - Change app name in `app.json`

2. **Add Backend Integration**
   - Set up API endpoints
   - Connect authentication
   - Implement video upload

3. **Test on Multiple Devices**
   - Different screen sizes
   - iOS and Android
   - Physical devices

4. **Performance Optimization**
   - Image optimization
   - Video lazy loading
   - Animation performance

## 📦 Building for Production

### Build Standalone Apps

#### iOS (requires Apple Developer account)
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

### Publish Updates (Over-the-Air)
```bash
expo publish
```

## 🆘 Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **React Native**: https://reactnative.dev/docs/getting-started

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] Expo CLI installed globally
- [ ] Dependencies installed successfully
- [ ] Development server starts without errors
- [ ] App loads on simulator/emulator/device
- [ ] Navigation works between screens
- [ ] Dark mode toggle works
- [ ] All screens render correctly
- [ ] No console errors

## 🎉 You're Ready!

Your TripVibe mobile app should now be running! Explore all the screens and features.

---

**Happy Coding! 🚀**
