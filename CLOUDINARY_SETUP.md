# Cloudinary Setup Guide

## Overview
This app uses Cloudinary for image hosting and management. You need to configure your Cloudinary credentials before the image upload feature will work.

## Setup Steps

### 1. Create Cloudinary Account
- Go to [cloudinary.com](https://cloudinary.com/)
- Sign up for a free account (or log in if you have one)
- After signing up, you'll be taken to the Dashboard

### 2. Get Your Credentials
On your Cloudinary Dashboard, you'll find:
- **Cloud Name**: Your unique cloud name (e.g., "dwxyz123")
- **API Key**: Your API key
- **API Secret**: Your API secret (keep this private!)

### 3. Create Upload Preset
1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: Choose a name (e.g., "tripmate_avatars")
   - **Signing Mode**: Select **"Unsigned"** (important for mobile uploads)
   - **Folder**: Optional, e.g., "tripmate/avatars"
   - **Allowed formats**: jpg, png, webp
   - **Transformation**: Optional, add transformation for resizing (e.g., 500x500)
5. Click **Save**

### 4. Update Your Code
Open `src/services/imageUpload.js` and update the configuration:

```javascript
// Replace these with your actual Cloudinary credentials
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // e.g., 'dwxyz123'
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // e.g., 'tripmate_avatars'
```

### 5. Recommended Settings for Profile Images
When creating your upload preset, consider these settings:
- **Width**: 500px
- **Height**: 500px
- **Crop mode**: Fill or Thumb
- **Format**: Auto
- **Quality**: Auto
- **Face detection**: Enable (for better cropping)

## Security Notes
- The upload preset MUST be **unsigned** for mobile uploads
- Never commit your API Secret to version control
- Use unsigned presets for user-generated content
- Consider adding upload restrictions (file size, format) in Cloudinary settings

## Testing
After configuration:
1. Start your backend: `cd backend && node server.js`
2. Start your app: `npm start`
3. Sign up/Login
4. Go to Profile → Edit Profile
5. Try uploading an avatar image

## Troubleshooting
- **"Invalid cloud name"**: Check that CLOUDINARY_CLOUD_NAME is correct
- **"Upload preset not found"**: Ensure preset is created and name matches
- **"Unsigned upload restricted"**: Make sure preset signing mode is "Unsigned"
- **Image not showing**: Check image URL in response, might be CORS or network issue

## Free Tier Limits
Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is more than enough for development and small production apps.

## Alternative: Using Local Storage (Development Only)
If you want to test without Cloudinary:
1. Images can be stored as base64 in the database (not recommended for production)
2. Or set up a local file server with multer
3. Update `imageUpload.js` to save locally instead of uploading to Cloudinary
