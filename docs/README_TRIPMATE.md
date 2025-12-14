# TripMate - AI-Powered Trip Planner

A React Native mobile app for discovering, planning, and sharing travel experiences with AI assistance.

## 🎨 Design Theme

- **Primary Color**: Blue (#2679FF) - Trust, adventure, sky
- **Accent Color**: Green (#00C896) - Growth, nature, money/budget
- **Design Philosophy**: Minimal text, visual-first, AI-assisted content creation

## ✨ Features

### 1. **Get Started Screen**
- Onboarding with app features
- Social login options (Google, Apple, Email)
- Gradient primary action button

### 2. **Home Feed**
- Vertical scrolling trip cards
- Large video thumbnails (80% card height)
- Location, duration, and cost displayed prominently
- Quick save and play actions
- Floating upload button

### 3. **Post Details Screen** (3 Tabs)
- **Video Tab**: Full-screen video player with trip stats
- **Itinerary Tab**: Day-by-day activity breakdown with timing and locations
- **Budget Tab**: Detailed cost breakdown by category with total
- Author info and share functionality

### 4. **Create Post Screen** (4-Step Wizard)
- **Step 1**: Input destination, budget, days, interests
- **Step 2**: Upload video with AI suggestion
- **Step 3**: Review AI-generated itinerary and budget
- **Step 4**: Success confirmation
- Progress indicator at top

### 5. **Explore Screen**
- Search bar with filter button
- Category chips (All, Adventure, Nature, Culture, Food)
- Advanced filters panel (budget range, duration)
- Grid view of trips with quick stats
- Sort options

### 6. **AI Trip Planner**
- Input form: destination, budget, days, travel style, interests
- AI generation loading state with animation
- Generated results:
  - Complete day-by-day itinerary with timing and costs
  - Budget breakdown
  - Hotel recommendations with ratings
  - Restaurant suggestions
- Save trip functionality

### 7. **Profile Screen**
- User avatar and bio
- Stats: Trips, Likes, Bookmarks
- Tabs: My Trips, Saved, Drafts
- Edit profile action
- Settings section with dark mode toggle

### 8. **Notifications Screen**
- Different notification types (likes, comments, AI suggestions)
- Unread indicators
- Swipe to dismiss functionality
- Mark all as read

## 🧭 Navigation Structure

```
Stack Navigator
├── GetStarted (Landing)
└── Main (Tab Navigator)
    ├── Home Tab
    ├── Explore Tab
    ├── Planner Tab (AI Trip Planner)
    ├── Notifications Tab
    └── Profile Tab
    
Modal Screens:
├── PostDetails
└── CreatePost
```

## 📦 Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation 6.x (Stack + Bottom Tabs)
- **UI**: Expo Linear Gradient, Ionicons
- **State**: React Context (Theme Management)
- **Storage**: AsyncStorage (Theme persistence)

## 🎯 Key UX Principles

1. **Minimal Friction**: Quick actions, minimal text input
2. **Visual First**: Large images/videos, prominent visuals
3. **AI-Assisted**: Auto-generate itineraries and budgets
4. **Budget Transparency**: Clear cost breakdowns everywhere
5. **Dark Mode**: Full theme support with smooth transitions

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start Expo server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📱 Screens Overview

| Screen | Description |
|--------|-------------|
| GetStarted | Onboarding with social login |
| Home | Trip feed with vertical scrolling cards |
| Explore | Search and discover trips with filters |
| Trip Planner | AI-powered itinerary generation |
| Notifications | Activity feed with AI suggestions |
| Profile | User profile with stats and settings |
| Post Details | 3-tab view (Video, Itinerary, Budget) |
| Create Post | 4-step wizard with AI assistance |

## 🎨 Color Palette

```javascript
Primary: #2679FF (Blue)
Primary Dark: #1557CC
Primary Alpha: rgba(38, 121, 255, 0.1)

Accent: #00C896 (Green)
Accent Dark: #00A077
Accent Alpha: rgba(0, 200, 150, 0.1)

Light Mode:
- Background: #F8F9FA
- Card: #FFFFFF
- Text: #1A1A1A

Dark Mode:
- Background: #0D1117
- Card: #161B22
- Text: #E6EDF3
```

## 🔮 Future Enhancements

- Real video upload and playback
- Map integration with routes
- Real-time AI generation API
- Social features (following, messaging)
- Payment integration for bookings
- Offline mode for saved trips
- Multi-language support

---

Built with ❤️ for travelers by travelers
