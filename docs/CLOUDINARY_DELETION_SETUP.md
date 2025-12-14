# Cloudinary Image Deletion Setup

## ⚠️ IMPORTANT: Complete Setup Required

The image deletion feature requires **Cloudinary API credentials** to work properly. Follow these steps to complete the setup.

## 🔑 Step 1: Get Your Cloudinary Credentials

1. **Login to Cloudinary Dashboard**
   - Go to https://cloudinary.com/console
   - Login with your account

2. **Find Your Credentials** (Dashboard → Settings → Product Environment Credentials)
   - **Cloud Name**: `dxztq9eu6` (already configured)
   - **API Key**: Click "Reveal" to see your API Key
   - **API Secret**: Click "Reveal" to see your API Secret

## 📝 Step 2: Update Backend Configuration

### Update `.env` file in `backend/` folder:

```env
PORT=5001
MONGODB_URI=mongodb+srv://aashutoshdahal91_db_user:ADNnvSTBmXMjtd23@cluster0.e0gie5w.mongodb.net/?appName=Cluster0
JWT_SECRET=fdkjfkl2j3klf9sgaj293nv03nd2k3jfnv09fk23j
JWT_EXPIRE=7d
NODE_ENV=development

# Cloudinary Configuration - UPDATE THESE!
CLOUDINARY_CLOUD_NAME=dxztq9eu6
CLOUDINARY_API_KEY=YOUR_ACTUAL_API_KEY_HERE
CLOUDINARY_API_SECRET=YOUR_ACTUAL_API_SECRET_HERE
```

**Replace:**
- `YOUR_ACTUAL_API_KEY_HERE` → Your actual API Key from Cloudinary Dashboard
- `YOUR_ACTUAL_API_SECRET_HERE` → Your actual API Secret from Cloudinary Dashboard

## 🔄 Step 3: Restart Backend Server

After updating the `.env` file:

```bash
cd backend
node server.js
```

You should see:
```
Server running on port 5001
MongoDB connected
```

## ✅ How It Works Now

### New Architecture

```
┌─────────────────┐
│  EditProfile    │
│     Screen      │
└────────┬────────┘
         │
         ├─ Click "Change Photo/Cover"
         │
         ▼
┌─────────────────┐
│ cloudinaryService│ ← NEW: Handles all image operations
│   .js           │
└────────┬────────┘
         │
         ├─ 1. Pick new image (expo-image-picker)
         ├─ 2. Upload to Cloudinary
         ├─ 3. Get new image URL
         ├─ 4. Call backend to delete old image
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  /delete-image  │ ← NEW: Securely deletes from Cloudinary
└─────────────────┘
```

### Before vs After

#### ❌ Before (Not Working)
- Frontend tried to delete images directly
- No API Secret (can't delete without it)
- Old images accumulated in Cloudinary
- Security risk if secret exposed

#### ✅ After (Working)
- Frontend uploads new image first
- Backend deletes old image securely
- API Secret stays on server (safe)
- Old images properly cleaned up

## 📱 User Experience

### Changing Avatar
1. User clicks "Change Photo"
2. Picks new image → Crops to square
3. **Upload happens** → Shows spinner
4. **Old avatar deleted** → Automatically
5. New avatar shows up
6. User clicks "Save"

### Changing Cover
1. User clicks "Change Cover"
2. Picks new image → Crops to 16:9
3. **Upload happens** → Shows spinner
4. **Old cover deleted** → Automatically
5. New cover shows up
6. User clicks "Save"

## 🔧 API Endpoint Details

### `POST /api/auth/delete-image`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "publicId": "tripmate/avatars/photo_1234567890.jpg"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "result": "ok"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to delete image",
  "result": "not found"
}
```

## 🧪 Testing Checklist

### Test Avatar Deletion
- [ ] Upload an avatar
- [ ] Note the image URL in database
- [ ] Upload a different avatar
- [ ] Check Cloudinary dashboard - old avatar should be gone
- [ ] Check database - new URL should be saved

### Test Cover Deletion
- [ ] Upload a cover image
- [ ] Note the image URL in database
- [ ] Upload a different cover
- [ ] Check Cloudinary dashboard - old cover should be gone
- [ ] Check database - new URL should be saved

### Test Default Images
- [ ] Sign up (has default avatar)
- [ ] Upload custom avatar
- [ ] Default avatar should NOT be deleted (it's not on your Cloudinary)
- [ ] Only custom uploads get deleted

## 🐛 Troubleshooting

### "Failed to delete image"

**Possible Causes:**
1. **API credentials not set**
   - Check `backend/.env` file
   - Verify API Key and Secret are correct
   - No spaces or quotes around values

2. **Backend not restarted**
   - Stop backend (Ctrl+C)
   - Start again: `node server.js`
   - Check console for errors

3. **Wrong public_id**
   - Check console logs for extracted public_id
   - Format should be: `folder/filename` (no extension)
   - Example: `tripmate/avatars/photo_1702541234`

### "Image still showing in Cloudinary"

**Check:**
1. Console logs in backend terminal
2. Look for "Attempting to delete image: ..."
3. Check if result is "ok" or "not found"
4. Refresh Cloudinary dashboard

### "Upload works but delete doesn't"

**Solution:**
- Verify backend endpoint is accessible
- Check network tab in React Native debugger
- Look for `/api/auth/delete-image` request
- Check request/response in terminal

## 📊 Monitoring

### Backend Logs
When deletion happens, you'll see:
```
Attempting to delete image: tripmate/avatars/photo_1234567890
Image deleted successfully: tripmate/avatars/photo_1234567890
```

### Cloudinary Dashboard
- Go to **Media Library**
- Search for your uploaded images
- After deletion, they should disappear
- Refresh page to confirm

## 🔐 Security Best Practices

✅ **Good:**
- API Secret stored in `.env` (backend only)
- `.env` in `.gitignore` (not committed)
- Deletion happens server-side
- Token required for deletion endpoint

❌ **Bad (Never Do This):**
- Put API Secret in frontend code
- Commit `.env` to GitHub
- Allow unauthenticated deletion
- Expose API credentials in logs

## 📚 File Reference

### New Files Created
- ✅ `src/services/cloudinaryService.js` - Main image handling
- ✅ Backend deletion endpoint added
- ✅ Cloudinary package installed

### Modified Files
- ✅ `src/screens/EditProfileScreen.js` - Uses new service
- ✅ `backend/routes/auth.js` - Added delete route
- ✅ `backend/controllers/authController.js` - Added deleteImage function
- ✅ `backend/.env` - Added Cloudinary credentials

## 🎯 Quick Start Commands

```bash
# 1. Update backend/.env with your credentials

# 2. Install cloudinary package (already done)
cd backend
npm install cloudinary

# 3. Start backend
node server.js

# 4. In another terminal, start frontend
cd ..
npm start

# 5. Test the flow
# - Login → Profile → Edit Profile
# - Change avatar/cover
# - Check backend logs for deletion messages
```

## ✨ What Changed

| Feature | Before | After |
|---------|--------|-------|
| Image Upload | ✅ Working | ✅ Working |
| Delete Old Image | ❌ Not working | ✅ Working |
| Security | ⚠️ Tried client-side | ✅ Server-side |
| API Secret | ⚠️ Would be exposed | ✅ Kept private |
| Service File | ❌ Mixed code | ✅ Clean service |

## 🚀 Ready to Test!

After completing steps 1-3 above:

1. Login to your app
2. Go to Profile → Edit Profile  
3. Click "Change Photo" or "Change Cover"
4. Upload a new image
5. Check backend terminal - should see deletion logs
6. Check Cloudinary dashboard - old image gone!

---

**Need Help?** 
- Check `IMAGE_UPLOAD_GUIDE.md` for detailed image upload info
- Check `CLOUDINARY_SETUP.md` for initial setup
- Look at backend terminal logs for errors
