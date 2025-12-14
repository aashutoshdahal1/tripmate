import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';

/**
 * Target file size for videos (in MB)
 * Cloudinary free tier limit is 100MB per file
 * We target exactly 100MB when compression is needed
 */
const TARGET_SIZE_MB = 100;
const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

/**
 * Calculate optimal bitrate for a video to reach target file size
 * Formula: bitrate (bits/sec) = (targetSize in bytes * 8) / duration in seconds
 * 
 * @param {number} durationSeconds - Video duration in seconds
 * @param {number} targetSizeMB - Target file size in MB (default: 100MB)
 * @returns {number} Optimal bitrate in bits per second
 */
export const calculateTargetBitrate = (durationSeconds, targetSizeMB = TARGET_SIZE_MB) => {
  if (!durationSeconds || durationSeconds <= 0) {
    console.warn('⚠️ Invalid duration:', durationSeconds);
    return 2000000; // Default to 2 Mbps
  }

  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  
  // Calculate video bitrate (leave 20% for audio)
  // Audio typically uses ~128kbps (0.128 Mbps)
  const audioBitrate = 128000; // 128 kbps for audio
  const totalBitrate = (targetSizeBytes * 8) / durationSeconds;
  const videoBitrate = totalBitrate - audioBitrate;
  
  // Ensure bitrate is reasonable (between 500kbps and 10Mbps)
  const minBitrate = 500000; // 500 kbps minimum for quality
  const maxBitrate = 10000000; // 10 Mbps maximum
  
  const finalBitrate = Math.max(minBitrate, Math.min(maxBitrate, videoBitrate));
  
  console.log('🎬 BITRATE CALCULATION:', {
    duration: `${durationSeconds.toFixed(1)}s`,
    targetSize: `${targetSizeMB}MB`,
    totalBitrate: `${(totalBitrate / 1000000).toFixed(2)} Mbps`,
    videoBitrate: `${(finalBitrate / 1000000).toFixed(2)} Mbps`,
    audioBitrate: `${(audioBitrate / 1000).toFixed(0)} kbps`,
  });
  
  return Math.round(finalBitrate);
};

/**
 * Get compression quality based on target bitrate
 * Lower bitrate = lower quality setting
 * 
 * @param {number} bitrate - Target bitrate in bits per second
 * @returns {number} Quality value between 0 and 1
 */
export const getCompressionQuality = (bitrate) => {
  // Map bitrate to quality
  // 500kbps -> 0.3 (low)
  // 2Mbps -> 0.5 (medium)
  // 5Mbps+ -> 0.7 (high)
  
  if (bitrate < 1000000) { // < 1 Mbps
    return 0.3;
  } else if (bitrate < 3000000) { // < 3 Mbps
    return 0.5;
  } else if (bitrate < 6000000) { // < 6 Mbps
    return 0.6;
  } else {
    return 0.7;
  }
};

/**
 * Get file size of a video
 * 
 * @param {string} uri - Video file URI
 * @returns {Promise<number>} File size in bytes
 */
export const getFileSize = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    return fileInfo.size;
  } catch (error) {
    console.error('❌ Error getting file size:', error);
    throw error;
  }
};

/**
 * Get video duration from URI
 * Note: This requires loading the video, so it may take a moment
 * 
 * @param {string} uri - Video file URI
 * @returns {Promise<number>} Duration in seconds
 */
export const getVideoDuration = async (uri) => {
  try {
    // Use expo-video-thumbnails to get video info (faster than loading full video)
    const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
      time: 0,
    });
    
    // Unfortunately, expo-video-thumbnails doesn't return duration
    // We need to load the video to get duration
    const { sound } = await Video.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      null,
      false
    );
    
    const status = await sound.getStatusAsync();
    const durationMs = status.durationMillis || 0;
    const durationSeconds = durationMs / 1000;
    
    // Unload the sound
    await sound.unloadAsync();
    
    return durationSeconds;
  } catch (error) {
    console.error('❌ Error getting video duration:', error);
    throw error;
  }
};

/**
 * Validate if file size is within acceptable range of target
 * 
 * @param {number} fileSizeBytes - Actual file size in bytes
 * @param {number} targetSizeMB - Target size in MB
 * @returns {boolean} True if within acceptable range (target ± 10%)
 */
export const isFileSizeAcceptable = (fileSizeBytes, targetSizeMB = TARGET_SIZE_MB) => {
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const lowerBound = targetSizeBytes * 0.9; // 90% of target
  const upperBound = targetSizeBytes * 1.1; // 110% of target
  
  return fileSizeBytes >= lowerBound && fileSizeBytes <= upperBound;
};

/**
 * Format file size for display
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "45.2 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

/**
 * Estimate final file size based on duration and bitrate
 * 
 * @param {number} durationSeconds - Video duration in seconds
 * @param {number} bitrate - Video bitrate in bits per second
 * @returns {number} Estimated file size in bytes
 */
export const estimateFileSize = (durationSeconds, bitrate) => {
  const audioBitrate = 128000; // 128 kbps for audio
  const totalBitrate = bitrate + audioBitrate;
  const estimatedSize = (totalBitrate * durationSeconds) / 8;
  
  console.log('📊 ESTIMATED FILE SIZE:', {
    duration: `${durationSeconds.toFixed(1)}s`,
    videoBitrate: `${(bitrate / 1000000).toFixed(2)} Mbps`,
    estimatedSize: formatFileSize(estimatedSize),
  });
  
  return estimatedSize;
};

/**
 * Check if video needs compression
 * 
 * @param {number} fileSizeBytes - Current file size in bytes
 * @param {number} maxSizeMB - Maximum allowed size in MB (default: 100MB)
 * @returns {boolean} True if compression is needed
 */
export const needsCompression = (fileSizeBytes, maxSizeMB = 100) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSizeBytes > maxSizeBytes;
};
