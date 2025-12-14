import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { API_BASE_URL, CLOUDINARY_CONFIG, getApiUrl, API_ENDPOINTS } from '../config/api.config';

// 📹 VIDEO & IMAGE PICKER WITH METADATA EXTRACTION
export const pickMedia = async (type = 'video') => {
  try {
    console.log('🎬 PICKING MEDIA:', type);

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission denied');
    }

    // Pick media
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ['videos'] : type === 'image' ? ['images'] : ['videos', 'images'],
      allowsEditing: true,
      aspect: type === 'video' ? [16, 9] : [4, 3],
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
      exif: true, // Get EXIF data
    });

    if (result.canceled) {
      console.log('❌ USER CANCELLED');
      return null;
    }

    const asset = result.assets[0];
    console.log('📦 ASSET PICKED:', {
      uri: asset.uri,
      type: asset.type,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      fileSize: asset.fileSize,
      hasExif: !!asset.exif,
    });

    // Extract metadata from EXIF
    let metadata = {
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
    };

    // Try to get location from EXIF if available
    let location = null;
    if (asset.exif) {
      metadata.exif = {
        make: asset.exif.Make,
        model: asset.exif.Model,
        dateTime: asset.exif.DateTime || asset.exif.DateTimeOriginal,
        iso: asset.exif.ISOSpeedRatings,
        aperture: asset.exif.ApertureValue,
        shutterSpeed: asset.exif.ShutterSpeedValue,
      };

      // Check for GPS data in EXIF
      console.log('🔍 CHECKING EXIF GPS:', {
        GPSLatitude: asset.exif.GPSLatitude,
        GPSLongitude: asset.exif.GPSLongitude,
        GPSLatitudeRef: asset.exif.GPSLatitudeRef,
        GPSLongitudeRef: asset.exif.GPSLongitudeRef,
      });

      if (asset.exif.GPSLatitude && asset.exif.GPSLongitude) {
        const lat = convertDMSToDD(asset.exif.GPSLatitude, asset.exif.GPSLatitudeRef);
        const lon = convertDMSToDD(asset.exif.GPSLongitude, asset.exif.GPSLongitudeRef);
        
        // Only use location if both coordinates are valid numbers
        if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
          location = {
            latitude: lat,
            longitude: lon,
            fromExif: true,
          };
          console.log('📍 LOCATION FROM EXIF:', location);
        } else {
          console.log('⚠️ Invalid EXIF GPS coordinates:', { lat, lon });
        }
      }
    }

    // If no EXIF location, try to get from Media Library asset info
    if (!location && asset.uri.startsWith('file://')) {
      try {
        const mediaAsset = await MediaLibrary.getAssetInfoAsync(asset.uri.replace('file://', ''));
        if (mediaAsset && mediaAsset.location) {
          location = {
            latitude: mediaAsset.location.latitude,
            longitude: mediaAsset.location.longitude,
            fromMediaLibrary: true,
          };
          console.log('📍 LOCATION FROM MEDIA LIBRARY:', location);
        } else {
          console.log('⚠️ Media library info available but no location data');
        }
      } catch (mediaLibError) {
        console.log('⚠️ Could not get media library info:', mediaLibError.message);
      }
    }

    // If still no location, try to get current location
    if (!location) {
      try {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            fromCurrent: true,
          };
          console.log('📍 LOCATION FROM CURRENT:', location);
        }
      } catch (locationError) {
        console.log('⚠️ Could not get current location:', locationError.message);
      }
    }

    // Reverse geocode to get address (only if coordinates are valid)
    if (location && 
        location.latitude !== null && 
        location.longitude !== null &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude)) {
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        if (addresses.length > 0) {
          const address = addresses[0];
          location.address = {
            city: address.city || address.subregion,
            region: address.region,
            country: address.country,
            formatted: [address.city || address.subregion, address.country].filter(Boolean).join(', '),
          };
          console.log('🏠 ADDRESS:', location.address);
        }
      } catch (geocodeError) {
        console.log('⚠️ Could not reverse geocode:', geocodeError.message);
      }
    }

    return {
      uri: asset.uri,
      type: asset.type || type,
      metadata,
      location,
    };
  } catch (error) {
    console.error('❌ PICK MEDIA ERROR:', error);
    throw error;
  }
};

// Helper function to convert DMS (Degrees, Minutes, Seconds) to DD (Decimal Degrees)
function convertDMSToDD(dms, ref) {
  // Handle null or undefined
  if (!dms) {
    console.log('⚠️ DMS is null or undefined');
    return null;
  }

  // If already a number (decimal degrees), return it
  if (typeof dms === 'number') {
    return ref === 'S' || ref === 'W' ? dms * -1 : dms;
  }

  // If it's an array [degrees, minutes, seconds]
  if (Array.isArray(dms) && dms.length === 3) {
    const degrees = Number(dms[0]);
    const minutes = Number(dms[1]);
    const seconds = Number(dms[2]);
    
    // Validate all values are numbers
    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      console.log('⚠️ Invalid DMS values:', { degrees, minutes, seconds });
      return null;
    }
    
    let dd = degrees + minutes / 60 + seconds / 3600;
    
    if (ref === 'S' || ref === 'W') {
      dd = dd * -1;
    }
    
    return dd;
  }
  
  console.log('⚠️ Unknown DMS format:', dms);
  return null;
}

// 📤 UPLOAD MEDIA TO CLOUDINARY
export const uploadMediaToCloudinary = async (mediaUri, type = 'video', onProgress) => {
  try {
    console.log('☁️ UPLOADING TO CLOUDINARY:', { type, uri: mediaUri });

    // Create form data
    const formData = new FormData();
    
    const fileExt = mediaUri.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}.${fileExt}`;
    
    formData.append('file', {
      uri: mediaUri,
      type: type === 'video' ? `video/${fileExt}` : `image/${fileExt}`,
      name: fileName,
    });
    
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'tripmate_posts');

    const resourceType = type === 'video' ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

    console.log('📤 UPLOADING TO:', uploadUrl);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          console.log(`📊 UPLOAD PROGRESS: ${progress.toFixed(0)}%`);
          if (onProgress) {
            onProgress(progress);
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('✅ CLOUDINARY UPLOAD SUCCESS:', {
            url: response.secure_url,
            publicId: response.public_id,
            duration: response.duration,
          });
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            thumbnail: response.thumbnail_url || response.secure_url,
            duration: response.duration,
            width: response.width,
            height: response.height,
            format: response.format,
          });
        } else {
          console.error('❌ CLOUDINARY UPLOAD FAILED:', xhr.responseText);
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('❌ CLOUDINARY UPLOAD ERROR');
        reject(new Error('Upload error'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('❌ UPLOAD TO CLOUDINARY ERROR:', error);
    throw error;
  }
};

// 📝 CREATE POST
export const createPost = async (postData, token) => {
  try {
    console.log('📝 CREATING POST:', postData);

    const response = await fetch(getApiUrl('/posts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create post');
    }

    console.log('✅ POST CREATED:', data.data._id);
    return data.data;
  } catch (error) {
    console.error('❌ CREATE POST ERROR:', error);
    throw error;
  }
};

// 📥 GET USER POSTS
export const getUserPosts = async (userId, page = 1, limit = 10) => {
  try {
    console.log('📥 FETCHING USER POSTS:', { userId, page, limit });

    const response = await fetch(getApiUrl(`/posts/user/${userId}?page=${page}&limit=${limit}`));

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch posts');
    }

    console.log('✅ POSTS FETCHED:', data.data.length);
    return data;
  } catch (error) {
    console.error('❌ GET USER POSTS ERROR:', error);
    throw error;
  }
};

// 📥 GET FEED POSTS
export const getFeedPosts = async (page = 1, limit = 10) => {
  try {
    console.log('📥 FETCHING FEED POSTS:', { page, limit });

    const response = await fetch(getApiUrl(`/posts?page=${page}&limit=${limit}`));

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch posts');
    }

    console.log('✅ FEED POSTS FETCHED:', data.data.length);
    return data;
  } catch (error) {
    console.error('❌ GET FEED POSTS ERROR:', error);
    throw error;
  }
};

// 🗑️ DELETE POST
export const deletePost = async (postId, token) => {
  try {
    console.log('🗑️ DELETING POST:', postId);

    const response = await fetch(getApiUrl(`/posts/${postId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }

    console.log('✅ POST DELETED');
    return data;
  } catch (error) {
    console.error('❌ DELETE POST ERROR:', error);
    throw error;
  }
};
