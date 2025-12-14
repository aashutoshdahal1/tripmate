import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, CLOUDINARY_CONFIG, API_ENDPOINTS, getApiUrl } from '../config/api.config';

const CLOUDINARY_CLOUD_NAME = CLOUDINARY_CONFIG.cloudName;
const CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_CONFIG.uploadPreset;

console.log('🔧 Cloudinary Service Configuration:');
console.log('   API URL:', API_BASE_URL);
console.log('   Cloud Name:', CLOUDINARY_CLOUD_NAME);
console.log('   Upload Preset:', CLOUDINARY_UPLOAD_PRESET);

/**
 * Extract public_id from Cloudinary URL
 */
const extractPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return null;
  }

  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload/v{version}/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Check if URL is a Cloudinary image
 */
const isCloudinaryImage = (imageUrl) => {
  return imageUrl && imageUrl.includes('cloudinary.com');
};

/**
 * Delete image from Cloudinary via backend
 */
export const deleteCloudinaryImage = async (imageUrl, token) => {
  if (!imageUrl || !isCloudinaryImage(imageUrl)) {
    console.log('Not a Cloudinary image, skipping deletion');
    return { success: true, skipped: true };
  }

  const publicId = extractPublicId(imageUrl);
  
  if (!publicId) {
    console.log('Could not extract public_id, skipping deletion');
    return { success: true, skipped: true };
  }

  try {
    console.log('🗑️ Attempting to delete image...');
    console.log('   URL:', imageUrl);
    console.log('   Public ID:', publicId);
    console.log('   Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_IMAGE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();
    console.log('🔄 Backend response:', data);

    if (response.ok && data.success) {
      console.log('✅ Image deleted successfully:', publicId);
      return { success: true, deleted: true };
    } else {
      console.warn('❌ Image deletion failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Pick image from gallery
 */
export const pickImage = async (aspectRatio = [1, 1]) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert('Permission Required', 'Permission to access camera roll is required!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: aspectRatio,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0];
  }

  return null;
};

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    
    const fileExtension = imageUri.split('.').pop();
    const fileName = `photo_${Date.now()}.${fileExtension}`;

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Complete flow: Pick and upload image
 */
export const pickAndUploadImage = async (aspectRatio = [1, 1]) => {
  const image = await pickImage(aspectRatio);
  
  if (!image) {
    return null;
  }

  const uploadResult = await uploadToCloudinary(image.uri);
  
  if (uploadResult.success) {
    return {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    };
  } else {
    Alert.alert('Upload Failed', uploadResult.error || 'Could not upload image');
    return null;
  }
};

/**
 * Replace image: Delete old, upload new
 */
export const replaceImage = async (oldImageUrl, aspectRatio, token) => {
  try {
    console.log('🔄 Starting image replacement...');
    console.log('   Old image URL:', oldImageUrl);
    
    // Pick new image first
    const newImage = await pickAndUploadImage(aspectRatio);
    
    if (!newImage) {
      console.log('⚠️ User cancelled or upload failed');
      return null; // User cancelled or upload failed
    }

    console.log('✅ New image uploaded:', newImage.url);

    // Delete old image if it exists
    if (oldImageUrl && isCloudinaryImage(oldImageUrl)) {
      console.log('🗑️ Now deleting old image...');
      const deleteResult = await deleteCloudinaryImage(oldImageUrl, token);
      if (deleteResult.deleted) {
        console.log('✅ Old image deleted successfully');
      } else if (deleteResult.skipped) {
        console.log('⏭️ Old image deletion skipped');
      } else {
        console.warn('⚠️ Old image deletion failed, but continuing with new image');
      }
    } else {
      console.log('ℹ️ No old Cloudinary image to delete');
    }

    return newImage;
  } catch (error) {
    console.error('❌ Error replacing image:', error);
    Alert.alert('Error', 'Failed to replace image');
    return null;
  }
};
