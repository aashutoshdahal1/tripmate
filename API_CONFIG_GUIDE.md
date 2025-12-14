# API Configuration Guide

## Overview
All API endpoints and configuration are centralized in `src/config/api.config.js`.

## Configuration File Location
```
src/
  └── config/
      └── api.config.js   ← Single source of truth for all API settings
```

## What's Configured

### 1. API Base URL
```javascript
export const API_BASE_URL = 'http://192.168.5.71:5001/api';
```

**Update this based on your environment:**

| Environment | URL | When to Use |
|------------|-----|-------------|
| iOS Simulator | `http://localhost:5001/api` | Testing on iOS simulator |
| Android Emulator | `http://10.0.2.2:5001/api` | Testing on Android emulator |
| Real Device | `http://YOUR_IP:5001/api` | Testing on physical device |
| Production | `https://api.yourapp.com/api` | Production deployment |

**Find your IP address:**
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig
```

### 2. Cloudinary Configuration
```javascript
export const CLOUDINARY_CONFIG = {
  cloudName: 'dxztq9eu6',
  uploadPreset: 'tripmatebucket',
};
```

### 3. API Endpoints
```javascript
export const API_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GET_ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  DELETE_IMAGE: '/auth/delete-image',
};
```

## Usage Examples

### In Service Files

**Before (hardcoded):**
```javascript
const response = await fetch('http://192.168.5.71:5001/api/auth/login', {
  method: 'POST',
  // ...
});
```

**After (using config):**
```javascript
import { API_ENDPOINTS, getApiUrl } from '../config/api.config';

const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
  method: 'POST',
  // ...
});
```

### Adding New Endpoints

1. **Add to config:**
   ```javascript
   // src/config/api.config.js
   export const API_ENDPOINTS = {
     // ... existing endpoints
     GET_TRIPS: '/trips',
     CREATE_TRIP: '/trips/create',
   };
   ```

2. **Use in service:**
   ```javascript
   import { getApiUrl, API_ENDPOINTS } from '../config/api.config';
   
   const getTrips = async () => {
     const response = await fetch(getApiUrl(API_ENDPOINTS.GET_TRIPS));
     // ...
   };
   ```

## Files Using This Config

### ✅ Already Updated
- `src/services/api.js` - All auth endpoints
- `src/services/cloudinaryService.js` - Image deletion endpoint

### 🔄 Update These If Needed
- Any new service files you create
- Any component making direct API calls

## Quick Setup Checklist

### For Development on Real Device
1. ✅ Find your computer's IP address
2. ✅ Update `API_BASE_URL` in `src/config/api.config.js`
3. ✅ Make sure both device and computer are on same WiFi
4. ✅ Restart Metro bundler: `npm start`

### For iOS Simulator
1. ✅ Change to: `http://localhost:5001/api`
2. ✅ Restart Metro bundler

### For Android Emulator
1. ✅ Change to: `http://10.0.2.2:5001/api`
2. ✅ Restart Metro bundler

### For Production
1. ✅ Deploy backend to server (e.g., Heroku, AWS, DigitalOcean)
2. ✅ Get production URL (e.g., `https://tripmate-api.herokuapp.com`)
3. ✅ Update `API_BASE_URL` to: `https://tripmate-api.herokuapp.com/api`
4. ✅ Build production app

## Environment-Specific Configuration (Optional)

If you want different configs for dev/staging/prod, you can do:

```javascript
// src/config/api.config.js
const ENV = 'development'; // Change to 'staging' or 'production'

const CONFIGS = {
  development: {
    baseUrl: 'http://192.168.5.71:5001/api',
  },
  staging: {
    baseUrl: 'https://staging-api.yourapp.com/api',
  },
  production: {
    baseUrl: 'https://api.yourapp.com/api',
  },
};

export const API_BASE_URL = CONFIGS[ENV].baseUrl;
```

## Troubleshooting

### "Network request failed"
- ✅ Check backend is running: `cd backend && node server.js`
- ✅ Check IP address is correct
- ✅ Check both devices on same network
- ✅ Check firewall not blocking port 5001

### "Cannot connect to server"
- ✅ Ping the server: `ping 192.168.5.71`
- ✅ Try accessing in browser: `http://192.168.5.71:5001/api/auth/me`
- ✅ Check backend terminal for errors

### "API_URL is undefined"
- ✅ Make sure you import from config file
- ✅ Restart Metro bundler
- ✅ Clear cache: `npm start -- --reset-cache`

## Benefits of Centralized Config

✅ **Single Source of Truth**
   - Change API URL in one place, applies everywhere

✅ **Easy Environment Switching**
   - Switch between dev/staging/prod easily

✅ **Type Safety** (if using TypeScript)
   - Autocomplete for endpoint names

✅ **Maintainability**
   - No more searching through files for hardcoded URLs

✅ **Less Errors**
   - No typos in endpoint paths
   - Consistent URLs across app

## Best Practices

1. **Never hardcode URLs** in component/service files
2. **Always import** from `api.config.js`
3. **Use getApiUrl()** helper for full URLs
4. **Update config** when deploying
5. **Document changes** when adding new endpoints

## Example: Complete API Call

```javascript
import { getApiUrl, API_ENDPOINTS } from '../config/api.config';
import { getToken } from './api';

export const createTrip = async (tripData) => {
  try {
    const token = await getToken();
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_TRIP), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create trip');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};
```

---

**Remember:** After changing `API_BASE_URL`, always restart the Metro bundler for changes to take effect!

```bash
# Stop Metro (Ctrl+C), then:
npm start
```
