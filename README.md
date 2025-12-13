# TripVibe - Travel Video Social Media App (React Native)

A modern, premium mobile app for sharing travel videos and detailed itineraries. Built with React Native, Expo, and inspired by Instagram and TikTok UI patterns.

## 🎨 Design Features

- **Modern & Minimal**: Clean, travel-focused aesthetic with rounded corners and soft shadows
- **Premium Branding**: Unique gradient-based design system (Forest Green → Sand Beige → Sunset Red)
- **Dark Mode**: Full support for light and dark themes with smooth transitions
- **Smooth Animations**: Micro-interactions and gesture-based navigation
- **Responsive**: Optimized for all mobile screen sizes

## 📱 Main Screens

### 1. Home Feed Screen
- Vertical scrolling feed of travel videos
- Floating top bar with TripVibe branding
- Trending destinations carousel
- Auto-play video previews
- Like, comment, save, and share buttons

### 2. Video Player Screen (Full-Screen)
- Immersive full-screen vertical video player
- Swipe-up gesture to reveal itinerary
- Transparent overlays with video information
- Right-side action buttons (like, comment, share, save)
- Floating "View Itinerary" button

### 3. Itinerary Detailed View
- Day-by-day itinerary breakdown
- Location cards with activities
- Budget and duration information
- Destinations list with icons
- Download itinerary as PDF button

### 4. Explore Screen
- Search bar with category filters
- Trending destinations grid
- Filter by region, budget, duration
- Beautiful emoji-based destination cards

### 5. Upload Flow
- 4-step wizard:
  1. Upload video
  2. Add title, description, location
  3. Build itinerary (day by day)
  4. Review and publish
- Progress indicator at top
- Modern form inputs with icons

### 6. Profile Page
- Circular avatar with gradient ring
- Biography and travel stats
- Follower/following counts
- Travel statistics (views, countries, cities)
- Tabs: Videos | Itineraries | Saved
- Edit profile button

### 7. Settings Screen
- Dark mode toggle
- Notification preferences
- Account settings
- Privacy and security
- Downloaded itineraries
- Help center and support

### 8. Authentication
- Modern login screen with gradient background
- Sign up with social media options
- Forgot password flow
- Smooth keyboard handling

## 🎨 Color Palette

### Light Mode
- **Primary**: Forest Green (#2A9D8F)
- **Secondary**: Sand Beige (#E9C46A)
- **Accent**: Sunset Red (#E76F51)
- **Background**: Cream White (#F4F1DE)

### Dark Mode
- **Primary**: Bright Forest Green (#3DB5A7)
- **Secondary**: Sand Beige (#E9C46A)
- **Accent**: Sunset Red (#E76F51)
- **Background**: Deep Navy (#0A0F24)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android)

### Installation

1. **Navigate to the TripMate folder**:
```bash
cd TripMate
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm start
# or
expo start
```

4. **Run on a device or simulator**:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📦 Project Structure

```
TripMate/
├── App.js                          # Main app entry point
├── src/
│   ├── components/                 # Reusable components
│   │   ├── Button.js              # Custom button component
│   │   └── VideoCard.js           # Video card component
│   ├── constants/
│   │   └── colors.js              # Color system and theme constants
│   ├── contexts/
│   │   └── ThemeContext.js        # Theme management (light/dark mode)
│   ├── navigation/
│   │   └── AppNavigator.js        # Navigation structure
│   └── screens/                    # All app screens
│       ├── HomePage.js            # Home feed
│       ├── VideoWatchPage.js      # Full-screen video player
│       ├── ItineraryPage.js       # Itinerary details
│       ├── ExplorePage.js         # Search and explore
│       ├── UploadPage.js          # Video upload flow
│       ├── ProfilePage.js         # User profile
│       ├── LoginPage.js           # Login screen
│       ├── SignupPage.js          # Sign up screen
│       └── SettingsPage.js        # Settings and preferences
```

## 🔧 Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and toolchain
- **React Navigation**: Navigation library (Stack, Tab, Drawer)
- **Expo Linear Gradient**: Gradient backgrounds
- **Expo AV**: Video playback
- **React Native Gesture Handler**: Touch gestures
- **React Native Reanimated**: Smooth animations
- **AsyncStorage**: Local data persistence
- **Ionicons**: Icon library

## 🎯 Key Features

### Theme System
- Automatic dark mode detection
- Manual theme toggle in settings
- Persistent theme preference
- Smooth theme transitions

### Navigation
- Bottom tab navigation (Home, Explore, Upload, Profile)
- Stack navigation for detailed views
- Modal presentations for full-screen video
- Deep linking support

### Video Features
- Auto-play in feed
- Full-screen playback
- Gesture controls
- Like, comment, share, save
- Integrated itinerary viewing

### Itinerary System
- Day-by-day planning
- Location tracking
- Budget estimation
- Activity lists
- Downloadable PDFs

## 📱 Screens Overview

| Screen | Description | Features |
|--------|-------------|----------|
| **HomePage** | Video feed | Trending destinations, video cards, auto-play |
| **VideoWatchPage** | Full-screen player | Swipe gestures, itinerary reveal, interactions |
| **ItineraryPage** | Itinerary details | Daily plan, destinations, budget, download |
| **ExplorePage** | Search & discover | Categories, filters, destination grid |
| **UploadPage** | Upload wizard | 4-step process, form validation, preview |
| **ProfilePage** | User profile | Stats, tabs, edit profile, gradient avatar |
| **SettingsPage** | App settings | Dark mode, notifications, account, support |
| **LoginPage** | Authentication | Email/password, social login, gradient BG |
| **SignupPage** | Registration | Form validation, account creation |

## 🎨 Design System

### Spacing
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

### Typography
- XS: 12px
- SM: 14px
- MD: 16px
- LG: 18px
- XL: 20px
- XXL: 24px
- XXXL: 32px

### Border Radius
- SM: 4px
- MD: 8px
- LG: 12px
- XL: 16px
- XXL: 24px
- Round: 9999px

## 🔄 State Management

Currently using:
- React Context API for theme management
- Local component state for UI interactions
- AsyncStorage for persistent data

For production, consider:
- Redux or MobX for global state
- React Query for server state
- Zustand for lightweight state management

## 🚀 Deployment

### iOS (App Store)
```bash
expo build:ios
```

### Android (Play Store)
```bash
expo build:android
```

### Over-the-Air Updates
```bash
expo publish
```

## 📝 TODO / Future Enhancements

- [ ] Real video recording and upload
- [ ] Map integration for itineraries
- [ ] Social features (follow, friends)
- [ ] Push notifications
- [ ] Offline mode and caching
- [ ] Video editing tools
- [ ] Multi-language support
- [ ] Analytics integration
- [ ] Payment integration (premium features)
- [ ] Story feature (24h videos)

## 🐛 Known Issues

- Video playback requires proper backend integration
- Some animations may need performance optimization
- Image uploads not yet implemented
- Mock data currently used for all content

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a portfolio/demo project. Feel free to fork and customize!

## 📧 Contact

For questions or feedback, please reach out through the repository issues.

---

**Built with ❤️ using React Native & Expo**
