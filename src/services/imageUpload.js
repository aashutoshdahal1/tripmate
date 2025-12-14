import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'dxztq9eu6'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'tripmatebucket'; // Replace with your upload preset

export const pickImage = async (aspectRatio = [1, 1]) => {
  // Request permission
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert('Permission Required', 'Permission to access camera roll is required!');
    return null;
  }

  // Pick image
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

export const uploadToCloudinary = async (imageUri) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get file extension
    const fileExtension = imageUri.split('.').pop();
    const fileName = `photo_${Date.now()}.${fileExtension}`;

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary
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

// Delete image from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return { success: true }; // Not a Cloudinary image, no need to delete
    }

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      return { success: true };
    }

    // Get everything after 'upload/v{version}/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Remove file extension

    console.log('Attempting to delete image with public_id:', publicId);
    
    // Note: Deletion requires server-side implementation with API secret
    // For now, we'll just return success and let old images remain
    // You should implement a backend endpoint to handle deletion
    return { success: true, message: 'Image deletion should be handled server-side' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

export const uploadImage = async (aspectRatio = [1, 1]) => {
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
