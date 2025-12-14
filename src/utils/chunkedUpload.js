import * as FileSystem from 'expo-file-system/legacy';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for stable upload

/**
 * Upload file in chunks with progress tracking
 * @param {string} fileUri - Local file URI
 * @param {string} uploadUrl - Cloudinary upload URL
 * @param {object} formData - Form data to include with upload
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<object>} Upload response
 */
export const uploadFileInChunks = async (fileUri, uploadUrl, formData, onProgress) => {
  try {
    console.log('📦 Starting chunked upload...');
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File not found');
    }

    const fileSize = fileInfo.size;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    
    console.log(`📦 File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`📦 Total chunks: ${totalChunks}`);

    // For files smaller than chunk size, use regular upload
    if (totalChunks === 1) {
      console.log('📦 File is small, using regular upload');
      return await regularUpload(fileUri, uploadUrl, formData, onProgress);
    }

    // Read file as base64 for chunking
    const fileData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let uploadedChunks = 0;
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Upload chunks sequentially
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileSize);
      
      // Extract chunk
      const chunkData = fileData.substring(
        Math.floor(start * 4 / 3), // Base64 is 4/3 of original
        Math.floor(end * 4 / 3)
      );

      console.log(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks}`);

      // Upload chunk
      await uploadChunk(uploadUrl, {
        ...formData,
        chunk: chunkData,
        chunkIndex,
        totalChunks,
        uploadId,
      });

      uploadedChunks++;
      
      // Update progress
      const progress = (uploadedChunks / totalChunks) * 100;
      if (onProgress) {
        onProgress(progress);
      }
    }

    console.log('✅ All chunks uploaded successfully');

    // Finalize upload
    const finalResponse = await finalizeUpload(uploadUrl, {
      ...formData,
      uploadId,
      totalChunks,
    });

    return finalResponse;

  } catch (error) {
    console.error('❌ Chunked upload error:', error);
    throw error;
  }
};

/**
 * Upload a single chunk
 */
const uploadChunk = async (url, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Chunk upload failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Finalize chunked upload
 */
const finalizeUpload = async (url, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  formData.append('finalize', 'true');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'X-Upload-Finalize': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Finalize upload failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Regular upload for small files
 */
const regularUpload = async (fileUri, uploadUrl, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    formDataToSend.append('file', {
      uri: fileUri,
      type: 'video/mp4',
      name: 'upload.mp4',
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formDataToSend);
  });
};

export default uploadFileInChunks;
