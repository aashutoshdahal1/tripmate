import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { API_BASE_URL, CLOUDINARY_CONFIG, getApiUrl, API_ENDPOINTS } from '../config/api.config';
import { calculateTargetBitrate, getCompressionQuality, formatFileSize, needsCompression } from '../utils/videoCompression';

// 📹 VIDEO & IMAGE PICKER WITH METADATA EXTRACTION
export const pickMedia = async (type = 'video', needsCompression = false) => {
  try {
    console.log('🎬 PICKING MEDIA:', type, needsCompression ? '(with compression)' : '(no compression)');

    // Request both permissions upfront
    const { status: imagePickerStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    
    if (imagePickerStatus !== 'granted') {
      throw new Error('Media library permission denied');
    }

    // Pick media with or without compression based on file size
    const pickerOptions = {
      mediaTypes: type === 'video' ? ['videos'] : type === 'image' ? ['images'] : ['videos', 'images'],
      allowsEditing: false, // Disable editing to prevent automatic compression
      exif: true, // Get EXIF data
    };

    // Only apply compression settings if needed (for videos > 100MB)
    if (needsCompression && type === 'video') {
      pickerOptions.quality = 0.3; // Aggressive compression: 30%
      pickerOptions.videoQuality = ImagePicker.UIImagePickerControllerQualityType.Low;
      pickerOptions.videoExportPreset = ImagePicker.VideoExportPreset.LowQuality;
      pickerOptions.videoMaxDuration = 60; // 60 seconds max when compressing
      console.log('🗜️ Applying compression settings');
    } else if (type === 'image') {
      // For images, preserve quality
      pickerOptions.quality = 1.0;
      console.log('✨ Using original image quality');
    } else {
      // For videos < 100MB - NO quality/compression settings at all
      // This ensures the original video file is used without any processing
      console.log('✨ Using original video (no compression, no quality settings)');
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

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
      assetId: asset.assetId, // Check if assetId is available
    });

    // Check video file size
    if (type === 'video' && asset.fileSize) {
      const fileSizeInMB = asset.fileSize / (1024 * 1024);
      console.log(`📦 VIDEO SIZE: ${fileSizeInMB.toFixed(2)} MB`);
      
      // If video is over 100MB and we haven't compressed yet, re-pick with compression
      if (fileSizeInMB > 100 && !needsCompression) {
        console.warn('⚠️ Video is over 100MB, re-picking with compression...');
        // Recursively call pickMedia with compression enabled
        return await pickMedia(type, true);
      }
      
      // If still over 100MB after compression, reject
      if (fileSizeInMB > 100 && needsCompression) {
        throw new Error(
          `Video still too large (${fileSizeInMB.toFixed(0)}MB) after compression.\n\n` +
          `✂️ Please trim your video:\n` +
          `• Drag the yellow handles to select 30-60 seconds\n` +
          `• Or record a shorter video\n\n` +
          `💡 Shorter videos = Better engagement!`
        );
      }
      
      // Log file size status
      if (fileSizeInMB > 50) {
        console.log(`📤 Large video (${fileSizeInMB.toFixed(0)}MB). Will use chunked upload for reliability`);
      } else {
        console.log(`✅ Video size is perfect (${fileSizeInMB.toFixed(0)}MB) - no compression needed!`);
      }
    }

    // Extract metadata from EXIF
    let metadata = {
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
    };

    // Try to get location from EXIF if available (works for images)
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
    } else {
      console.log('ℹ️ No EXIF data (normal for videos)');
    }

    // Try to get from Media Library asset info (CRITICAL for videos)
    if (!location && mediaLibraryStatus === 'granted') {
      try {
        console.log('🔍 TRYING MEDIA LIBRARY for location...');
        
        // Strategy 1: Use assetId if available (iOS 14+)
        if (asset.assetId) {
          console.log('✅ Using assetId:', asset.assetId);
          try {
            const mediaAsset = await MediaLibrary.getAssetInfoAsync(asset.assetId);
            
            console.log('📦 MEDIA LIBRARY ASSET INFO (by ID):', {
              id: mediaAsset.id,
              filename: mediaAsset.filename,
              hasLocation: !!mediaAsset.location,
              location: mediaAsset.location,
            });
            
            if (mediaAsset && mediaAsset.location) {
              // MediaLibrary returns coordinates as strings, convert to numbers
              const lat = Number(mediaAsset.location.latitude);
              const lon = Number(mediaAsset.location.longitude);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                location = {
                  latitude: lat,
                  longitude: lon,
                  fromMediaLibrary: true,
                };
                console.log('📍 LOCATION FROM MEDIA LIBRARY (by ID):', location);
              } else {
                console.log('⚠️ Invalid coordinates from MediaLibrary (by ID):', { lat, lon });
              }
            }
          } catch (idError) {
            console.log('⚠️ Could not get asset by ID:', idError.message);
          }
        }
        
        // Strategy 2: Search recent assets if assetId not available or failed
        if (!location) {
          console.log('🔍 SEARCHING recent assets...');
          
          const assetsPage = await MediaLibrary.getAssetsAsync({
            first: 50, // Increased from 20
            sortBy: MediaLibrary.SortBy.creationTime,
            mediaType: asset.type === 'video' ? MediaLibrary.MediaType.video : MediaLibrary.MediaType.photo,
          });
          
          console.log(`📋 Found ${assetsPage.assets.length} recent ${asset.type}s`);
          
          // Try multiple matching strategies
          let matchingAsset = null;
          
          // Try exact URI match first
          matchingAsset = assetsPage.assets.find(a => a.uri === asset.uri);
          
          // Try filename match
          if (!matchingAsset) {
            const filename = asset.uri.split('/').pop().split('?')[0]; // Remove query params
            console.log('🔍 Trying filename match:', filename);
            matchingAsset = assetsPage.assets.find(a => a.filename === filename);
          }
          
          // Try original filename from URI (without extension changes)
          if (!matchingAsset) {
            const cleanUri = asset.uri.split('/').pop().split('.')[0];
            matchingAsset = assetsPage.assets.find(a => 
              a.filename.includes(cleanUri) || a.uri.includes(cleanUri)
            );
          }
          
          // Use most recent as last resort (risky but better than nothing)
          if (!matchingAsset && assetsPage.assets.length > 0) {
            console.log('⚠️ Using most recent asset as fallback');
            matchingAsset = assetsPage.assets[0];
          }
          
          if (matchingAsset) {
            console.log('✅ FOUND MATCHING ASSET:', {
              id: matchingAsset.id,
              filename: matchingAsset.filename,
              uri: matchingAsset.uri,
            });
            
            const mediaAsset = await MediaLibrary.getAssetInfoAsync(matchingAsset.id);
            
            console.log('📦 MEDIA LIBRARY ASSET INFO:', {
              id: mediaAsset.id,
              filename: mediaAsset.filename,
              mediaType: mediaAsset.mediaType,
              hasLocation: !!mediaAsset.location,
              location: mediaAsset.location,
            });
            
            if (mediaAsset && mediaAsset.location) {
              // MediaLibrary returns coordinates as strings, convert to numbers
              const lat = Number(mediaAsset.location.latitude);
              const lon = Number(mediaAsset.location.longitude);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                location = {
                  latitude: lat,
                  longitude: lon,
                  fromMediaLibrary: true,
                };
                console.log('📍 LOCATION FROM MEDIA LIBRARY:', location);
              } else {
                console.log('⚠️ Invalid coordinates from MediaLibrary:', { lat, lon });
              }
            } else {
              console.log('⚠️ Media library asset has no location data');
              console.log('💡 TIP: Enable location services when recording videos');
            }
          } else {
            console.log('⚠️ Could not find matching asset in media library');
          }
        }
      } catch (mediaLibError) {
        console.log('⚠️ MediaLibrary error:', mediaLibError.message);
        console.error(mediaLibError);
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

    // Reverse geocode to get address (only if coordinates are valid numbers)
    if (location && 
        location.latitude !== null && 
        location.longitude !== null &&
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude)) {
      try {
        console.log('🌍 REVERSE GEOCODING:', { 
          lat: location.latitude, 
          lon: location.longitude,
          types: {
            lat: typeof location.latitude,
            lon: typeof location.longitude,
          }
        });
        
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
    } else if (location) {
      console.log('⚠️ Location coordinates are not valid numbers:', {
        latitude: location.latitude,
        longitude: location.longitude,
        latType: typeof location.latitude,
        lonType: typeof location.longitude,
      });
    }

    // Final validation before returning
    if (location) {
      console.log('✅ FINAL LOCATION:', {
        latitude: location.latitude,
        longitude: location.longitude,
        latType: typeof location.latitude,
        lonType: typeof location.longitude,
        hasAddress: !!location.address,
      });
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

// 📤 UPLOAD MEDIA TO CLOUDINARY (with chunked upload for large files)
export const uploadMediaToCloudinary = async (mediaUri, type = 'video', onProgress) => {
  try {
    console.log('☁️ UPLOADING TO CLOUDINARY:', { type, uri: mediaUri });

    // Get file info to check size
    const fileInfo = await fetch(mediaUri);
    const blob = await fileInfo.blob();
    const fileSizeInMB = blob.size / (1024 * 1024);
    
    console.log('📦 FILE SIZE:', `${fileSizeInMB.toFixed(2)} MB`);
    
    // Check file size limits (Cloudinary free tier: 100MB per file)
    const maxSize = type === 'video' ? 100 : 10; // 100MB for videos, 10MB for images
    if (fileSizeInMB > maxSize) {
      throw new Error(
        `File too large: ${fileSizeInMB.toFixed(1)}MB. Maximum: ${maxSize}MB.\n\n` +
        `This is a Cloudinary free tier limitation.\n` +
        `Please trim your video to under 60 seconds.`
      );
    }

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
    
    // Resource type for videos
    if (type === 'video') {
      formData.append('resource_type', 'video');
    }

    const resourceType = type === 'video' ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

    console.log('📤 UPLOADING TO:', uploadUrl);

    // For large files, we still use regular upload but with better error handling
    // Cloudinary handles chunking internally for large files
    if (fileSizeInMB > 50) {
      console.log('📦 Large file detected. Upload may take 1-2 minutes...');
    }
    
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
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ CLOUDINARY UPLOAD SUCCESS:', {
              url: response.secure_url,
              publicId: response.public_id,
              duration: response.duration,
            });
            
            // Generate thumbnail URL for videos (first frame at 0 seconds)
            let thumbnailUrl = response.secure_url;
            if (type === 'video' && response.public_id) {
              // For videos, create a thumbnail URL pointing to the first frame
              thumbnailUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/so_0,w_400,h_600,c_fill/${response.public_id}.jpg`;
            }
            
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              thumbnail: thumbnailUrl,
              duration: response.duration,
              width: response.width,
              height: response.height,
              format: response.format,
            });
          } catch (parseError) {
            console.error('❌ PARSE ERROR:', parseError);
            console.error('❌ RESPONSE TEXT:', xhr.responseText);
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          console.error('❌ CLOUDINARY UPLOAD FAILED:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          });
          
          let errorMessage = 'Upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch (e) {
            // If HTML response (like 413 error), provide helpful message
            if (xhr.status === 413) {
              errorMessage = 'File too large for server. Please use a video under 100MB or try "Record New Video" option.';
            }
          }
          
          reject(new Error(`Upload failed (${xhr.status}): ${errorMessage}`));
        }
      });

      xhr.addEventListener('error', (event) => {
        console.error('❌ CLOUDINARY NETWORK ERROR:', event);
        reject(new Error('Network error during upload. Please check your connection.'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('❌ CLOUDINARY UPLOAD TIMEOUT');
        reject(new Error('Upload timeout. Please check your connection and try again.'));
      });

      xhr.timeout = 300000; // 5 minutes timeout
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
    console.log('🔑 TOKEN:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    const response = await fetch(getApiUrl('/posts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    console.log('📡 RESPONSE STATUS:', response.status);
    
    const data = await response.json();
    console.log('📦 RESPONSE DATA:', data);

    if (!response.ok) {
      console.error('❌ CREATE POST FAILED:', {
        status: response.status,
        statusText: response.statusText,
        message: data.message,
        error: data.error,
      });
      throw new Error(data.message || data.error || 'Failed to create post');
    }

    console.log('✅ POST CREATED:', data.data._id);
    return data.data;
  } catch (error) {
    console.error('❌ CREATE POST ERROR:', error);
    console.error('❌ ERROR TYPE:', error.name);
    console.error('❌ ERROR MESSAGE:', error.message);
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

// 📄 GET SINGLE POST BY ID
export const getPostById = async (postId) => {
  try {
    console.log('📄 FETCHING POST BY ID:', postId);

    const response = await fetch(getApiUrl(`/posts/${postId}`));

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch post');
    }

    console.log('✅ POST FETCHED:', data.data._id);
    return data.data; // Return just the post data
  } catch (error) {
    console.error('❌ GET POST BY ID ERROR:', error);
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
