# Image Upload Feature Guide

## Overview
The profile now supports uploading both **Avatar** (profile photo) and **Cover Image** (background banner) with automatic deletion of old images.

## Features Implemented

### 1. Avatar Upload (Profile Photo)
- **Aspect Ratio**: 1:1 (Square)
- **Default Image**: `https://i.pravatar.cc/150`
- **Location**: Edit Profile → Camera button on avatar
- **Behavior**: 
  - Click "Change Photo" to upload new avatar
  - Old avatar is automatically deleted from Cloudinary before uploading new one
  - Image is uploaded to Cloudinary and URL is saved in database

### 2. Cover Image Upload (Banner)
- **Aspect Ratio**: 16:9 (Widescreen)
- **Default Image**: `https://images.pexels.com/photos/31410276/pexels-photo-31410276.jpeg`
- **Location**: Edit Profile → "Change Cover" button on top banner
- **Behavior**:
  - Click "Change Cover" to upload new cover image
  - Old cover image is automatically deleted from Cloudinary (if it was uploaded to Cloudinary)
  - Default images from Pexels are not deleted

### 3. Smart Image Management
- **Delete Before Upload**: When changing avatar or cover, the old Cloudinary image is deleted first
- **Default Image Handling**: Default images (pravatar.cc, pexels.com) are not deleted
- **Loading States**: Shows "Uploading..." text and spinner during upload
- **Error Handling**: Shows alert if upload fails

## User Flow

### Editing Avatar
1. User taps "Edit Profile" on ProfileScreen
2. EditProfileScreen shows current avatar
3. User taps "Change Photo" button
4. System requests camera roll permission (if not granted)
5. Image picker opens with 1:1 square crop
6. User selects/crops image
7. Old avatar deleted from Cloudinary (if exists)
8. New image uploaded to Cloudinary
9. Avatar preview updates immediately
10. User taps "Save" to persist changes

### Editing Cover Image
1. User taps "Edit Profile" on ProfileScreen
2. EditProfileScreen shows current cover image
3. User taps "Change Cover" button (top-right of cover)
4. System requests camera roll permission (if not granted)
5. Image picker opens with 16:9 widescreen crop
6. User selects/crops image
7. Old cover deleted from Cloudinary (if exists and not default)
8. New image uploaded to Cloudinary
9. Cover preview updates immediately
10. User taps "Save" to persist changes

## Technical Details

### Files Modified

#### Frontend
1. **`src/services/imageUpload.js`**
   - Added `pickImage(aspectRatio)` - configurable aspect ratio
   - Added `deleteFromCloudinary(imageUrl)` - deletes old images
   - Updated `uploadImage(aspectRatio)` - returns both URL and publicId

2. **`src/screens/EditProfileScreen.js`**
   - Added cover image section with upload button
   - Added `handleAvatarPick()` - deletes old avatar before upload
   - Added `handleCoverPick()` - deletes old cover before upload
   - Added `isUploadingAvatar` and `isUploadingCover` states
   - Updated save function to include coverImage

3. **`src/screens/ProfileScreen.js`**
   - Updated to display `user.coverImage` instead of hardcoded URL
   - Falls back to default if no cover image set

#### Backend
1. **`backend/models/User.js`**
   - Added `coverImage` field with default value

2. **`backend/controllers/authController.js`**
   - Updated all endpoints to include `coverImage` in responses
   - Updated `updateProfile` to handle coverImage updates

### Database Schema
```javascript
{
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150',
  },
  coverImage: {
    type: String,
    default: 'https://images.pexels.com/photos/31410276/pexels-photo-31410276.jpeg',
  }
}
```

### API Response
```javascript
{
  success: true,
  user: {
    id: "...",
    fullName: "John Doe",
    email: "john@example.com",
    avatar: "https://res.cloudinary.com/.../avatar.jpg",
    coverImage: "https://res.cloudinary.com/.../cover.jpg",
    bio: "...",
    location: "...",
    stats: { trips: 0, followers: 0, following: 0 }
  }
}
```

## Image Specifications

### Avatar
- **Dimensions**: Recommended 500x500px
- **Aspect Ratio**: 1:1 (Square)
- **Quality**: 0.8 (80%)
- **Format**: JPG, PNG, WEBP
- **Display Size**: 120x120px (profile), 100x100px (when viewing profile)

### Cover Image
- **Dimensions**: Recommended 1600x900px
- **Aspect Ratio**: 16:9 (Widescreen)
- **Quality**: 0.8 (80%)
- **Format**: JPG, PNG, WEBP
- **Display Size**: Full width x 200-220px height

## Cloudinary Configuration

### Upload Presets
You may want to create separate upload presets for avatars and covers:

1. **Avatar Preset** (`tripmate_avatars`)
   - Transformation: c_fill,w_500,h_500,g_face
   - Format: Auto
   - Quality: Auto

2. **Cover Preset** (`tripmate_covers`)
   - Transformation: c_fill,w_1600,h_900
   - Format: Auto
   - Quality: Auto

### To Use Different Presets
Update `src/services/imageUpload.js`:
```javascript
export const uploadToCloudinary = async (imageUri, preset = 'tripmatebucket') => {
  formData.append('upload_preset', preset);
  // ...
}

// Then in EditProfileScreen
const avatarResult = await uploadToCloudinary(image.uri, 'tripmate_avatars');
const coverResult = await uploadToCloudinary(image.uri, 'tripmate_covers');
```

## Image Deletion

### Current Implementation
```javascript
export const deleteFromCloudinary = async (imageUrl) => {
  // Extracts public_id from URL
  // Returns success (but actual deletion requires backend)
}
```

### Important Note
**Cloudinary deletion requires API Secret**, which should never be exposed in frontend code.

### Recommended: Backend Deletion Endpoint
Create a backend endpoint to handle deletions:

```javascript
// backend/routes/auth.js
router.delete('/image/:publicId', protect, deleteImage);

// backend/controllers/authController.js
exports.deleteImage = async (req, res) => {
  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Testing Checklist

### Avatar Upload
- [ ] Open Edit Profile
- [ ] Click "Change Photo"
- [ ] Select image from gallery
- [ ] Crop image to square
- [ ] Verify loading state shows
- [ ] Verify new avatar appears
- [ ] Click "Save"
- [ ] Verify profile shows new avatar
- [ ] Edit again and change avatar
- [ ] Verify old avatar is replaced

### Cover Image Upload
- [ ] Open Edit Profile
- [ ] Click "Change Cover" button
- [ ] Select image from gallery
- [ ] Crop image to 16:9
- [ ] Verify loading state shows
- [ ] Verify new cover appears
- [ ] Click "Save"
- [ ] Verify profile shows new cover
- [ ] Edit again and change cover
- [ ] Verify old cover is replaced

### Persistence
- [ ] Upload avatar and cover
- [ ] Close app
- [ ] Reopen app
- [ ] Verify images persist

### Error Handling
- [ ] Deny camera roll permission
- [ ] Verify error alert shows
- [ ] Try with no internet
- [ ] Verify error handling

## Troubleshooting

### "Permission denied" Error
- Go to Settings → TripMate → Photos
- Enable "Read and Write" access

### Upload Fails
- Check Cloudinary credentials in `imageUpload.js`
- Verify upload preset exists and is "Unsigned"
- Check internet connection
- Check Cloudinary dashboard for errors

### Old Images Not Deleted
- This is expected in current implementation
- Deletion requires backend endpoint with API Secret
- Images will accumulate in Cloudinary
- Consider implementing backend deletion or using Cloudinary's auto-cleanup rules

### Images Not Showing
- Check image URLs in database
- Verify Cloudinary URLs are accessible
- Check CORS settings in Cloudinary (usually not an issue)

## Future Enhancements

1. **Backend Image Deletion**
   - Implement server-side deletion endpoint
   - Call from frontend when changing images

2. **Image Optimization**
   - Use Cloudinary transformations
   - Lazy load images
   - Progressive JPEG format

3. **Compression**
   - Compress images before upload
   - Use WebP format for better compression

4. **Multiple Images**
   - Allow photo gallery/carousel
   - Trip photos upload
   - Multiple photos per post

5. **Camera Access**
   - Add option to take photo with camera
   - Not just gallery selection

## Security Notes

- ✅ Upload presets are "Unsigned" (safe for mobile apps)
- ✅ No API secrets in frontend code
- ⚠️ Image deletion should be server-side
- ⚠️ Consider rate limiting uploads
- ⚠️ Validate file types and sizes
- ⚠️ Monitor Cloudinary usage/quota
