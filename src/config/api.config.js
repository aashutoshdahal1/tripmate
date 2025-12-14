/**
 * API Configuration
 * 
 * Central configuration for all API endpoints and settings.
 * Update the API_BASE_URL based on your environment.
 */

// API Base URL Configuration
// Choose the appropriate URL based on where you're running the app:

// For iOS Simulator
// export const API_BASE_URL = 'http://localhost:5001/api';

// For Android Emulator
// export const API_BASE_URL = 'http://10.0.2.2:5001/api';

// For Real Device (update with your computer's IP)
// Find your IP: macOS -> ipconfig getifaddr en0 | Linux -> hostname -I
export const API_BASE_URL = 'http://192.168.5.71:5001/api';

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dxztq9eu6',
  uploadPreset: 'tripmatebucket',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GET_ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  DELETE_IMAGE: '/auth/delete-image',
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Log configuration on app start
console.log('📡 API Configuration Loaded:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Cloudinary:', CLOUDINARY_CONFIG.cloudName);
