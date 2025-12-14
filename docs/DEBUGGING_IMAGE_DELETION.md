# 🐛 Debugging Image Deletion Issues

## Current Status
Image deletion is not working. Let's debug step by step.

## 🔍 Step-by-Step Debugging Guide

### Step 1: Verify Backend is Running

```bash
cd backend
node server.js
```

**Expected Output:**
```
Server running on port 5001
MongoDB connected
```

**If you see errors:** Fix them before continuing.

---

### Step 2: Test Cloudinary Connection

Run the test script:

```bash
cd backend
node test-cloudinary-deletion.js
```

**Expected Output:**
```
=== Cloudinary Configuration Test ===
Cloud Name: dxztq9eu6
API Key: ✅ Set
API Secret: ✅ Set

=== Test 1: Listing Recent Images ===
Found X images:
1. photo_1234567890
   URL: https://res.cloudinary.com/...
   Created: 2024-12-14...
```

**If you see errors:**
- ❌ "API Key: ❌ Missing" → Check `backend/.env` file
- ❌ "API Secret: ❌ Missing" → Check `backend/.env` file
- ❌ "401 Unauthorized" → API credentials are wrong

---

### Step 3: Check Frontend Logs

When you upload a new image, check the **Metro Bundler terminal** for these logs:

```
🔄 Starting image replacement...
   Old image URL: https://res.cloudinary.com/dxztq9eu6/...
✅ New image uploaded: https://res.cloudinary.com/dxztq9eu6/...
🗑️ Now deleting old image...
🗑️ Attempting to delete image...
   URL: https://res.cloudinary.com/dxztq9eu6/...
   Public ID: photo_1234567890
   Token: Present
```

**If you don't see these logs:**
- The deletion code is not being called
- Check EditProfileScreen is using the right function

**If you see "Token: Missing":**
- Authentication token not found
- Check `getToken()` function in api.js

---

### Step 4: Check Backend Logs

In the **Node.js terminal**, you should see:

```
🔵 DELETE IMAGE REQUEST RECEIVED
   Public ID: photo_1234567890
   User: 675d...
🗑️ Attempting to delete from Cloudinary: photo_1234567890
📦 Cloudinary response: { result: 'ok' }
✅ Image deleted successfully
```

**If you don't see these logs:**
- Request is not reaching backend
- Check if backend is running on port 5001
- Check API_URL in cloudinaryService.js

**If you see different response:**
- `{ result: 'not found' }` → Image already deleted or wrong public_id
- `{ result: 'error' }` → Cloudinary credentials issue

---

### Step 5: Manual Test via Backend

Test deletion directly in Node.js:

```bash
cd backend
node
```

Then paste this code:

```javascript
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Replace with your actual public_id
cloudinary.uploader.destroy('photo_1234567890')
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

**Expected Output:**
```
Result: { result: 'ok' }
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Token: Missing" in Frontend Logs

**Problem:** No authentication token available.

**Solution:**
Check `src/services/api.js`:

```javascript
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔑 Token retrieved:', token ? 'Present' : 'Missing');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};
```

### Issue 2: Request Not Reaching Backend

**Problem:** No logs in backend terminal.

**Solution 1:** Check API_URL in `cloudinaryService.js`:
```javascript
const API_URL = 'http://localhost:5001/api';
```

**Solution 2:** If testing on physical device, use your computer's IP:
```javascript
const API_URL = 'http://192.168.1.X:5001/api';
```

Find your IP:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### Issue 3: "Public ID is required" Error

**Problem:** Public ID extraction failed.

**Solution:** Check the image URL format. Should be:
```
https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567890/photo_name.jpg
                                                   ^^^^^^^^^^^^^ ^^^^^^^^^^
                                                   version       public_id
```

Test extraction:
```javascript
const url = "YOUR_IMAGE_URL";
const urlParts = url.split('/');
const uploadIndex = urlParts.findIndex(part => part === 'upload');
const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
console.log('Public ID:', publicId);
```

### Issue 4: "Not Found" Response from Cloudinary

**Problem:** Image doesn't exist in Cloudinary.

**Possible Causes:**
1. Image was already deleted
2. Wrong public_id extracted
3. Image in a folder (e.g., `folder/photo_123`)

**Solution:**
Check Cloudinary dashboard:
1. Go to https://cloudinary.com/console/media_library
2. Search for your image
3. Click on it → See the actual Public ID
4. Compare with what's being sent

### Issue 5: Deletion Works but Image Still Shows

**Problem:** Image deleted from Cloudinary but still visible in app.

**Cause:** Cloudinary CDN caching.

**Solution:**
1. Clear app cache
2. Wait 5-10 minutes for CDN to update
3. Use a new URL parameter: `?v=${Date.now()}`

---

## 📊 Monitoring Checklist

Run through this checklist when testing:

### Backend Checklist
- [ ] Backend running on port 5001
- [ ] Cloudinary credentials in .env
- [ ] No errors in backend terminal
- [ ] DELETE IMAGE REQUEST logs appear
- [ ] Response shows "ok" or "not found"

### Frontend Checklist
- [ ] Token is present in logs
- [ ] Old image URL is logged
- [ ] Public ID extracted correctly
- [ ] Backend response received
- [ ] New image replaces old one

### Cloudinary Checklist
- [ ] Login to dashboard
- [ ] Check Media Library
- [ ] Verify old images are being deleted
- [ ] Check quota (deletion count)

---

## 🧪 Full Test Scenario

1. **Start Backend**
   ```bash
   cd backend
   node server.js
   ```

2. **Start App**
   ```bash
   cd ..
   npm start
   ```

3. **Open DevTools**
   - Shake device → Show Menu → Debug Remote JS
   - Or press `j` in Metro terminal

4. **Perform Test**
   - Login to app
   - Go to Profile → Edit Profile
   - Click "Change Photo"
   - Select a new image
   - Watch both terminals

5. **Expected Flow:**

   **Frontend (Metro):**
   ```
   🔄 Starting image replacement...
   ✅ New image uploaded
   🗑️ Now deleting old image...
   ✅ Old image deleted successfully
   ```

   **Backend (Node):**
   ```
   🔵 DELETE IMAGE REQUEST RECEIVED
   📦 Cloudinary response: { result: 'ok' }
   ✅ Image deleted successfully
   ```

6. **Verify on Cloudinary**
   - Go to Media Library
   - Search for old image
   - Should not be found

---

## 🔍 Debug Commands

### Check if backend is accessible:
```bash
curl http://localhost:5001/api/auth/me
```

### Test delete endpoint directly:
```bash
curl -X POST http://localhost:5001/api/auth/delete-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"publicId":"photo_1234567890"}'
```

### Check Cloudinary via CLI:
```bash
cd backend
node -e "
const c = require('cloudinary').v2;
require('dotenv').config();
c.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
c.api.resources().then(r => console.log(r.resources.map(x => x.public_id)));
"
```

---

## 📝 What to Check Right Now

1. **Is backend running?**
   ```bash
   lsof -i :5001
   ```
   If nothing shows up, start it: `cd backend && node server.js`

2. **Are credentials set?**
   ```bash
   cd backend
   cat .env | grep CLOUDINARY
   ```
   Should show all three values (cloud name, API key, API secret)

3. **Test upload first**
   - Upload an image
   - Check if it appears in Cloudinary dashboard
   - Note its public_id
   - Try to delete it manually using the test script

4. **Check the logs**
   - Both frontend (Metro) and backend (Node) terminals
   - Look for the emoji markers (🔄, ✅, ❌, 🗑️)
   - Share any error messages

---

## 🆘 Still Not Working?

If deletion still fails after checking everything above:

1. **Run the test script:**
   ```bash
   cd backend
   node test-cloudinary-deletion.js
   ```

2. **Share the output** including:
   - Backend terminal logs
   - Frontend Metro logs
   - Test script output
   - Any error messages

3. **Take a screenshot** of:
   - Cloudinary dashboard (Media Library)
   - Backend .env file (hide the API secret)
   - Terminal showing both backend and frontend running

This will help identify the exact issue! 🎯
