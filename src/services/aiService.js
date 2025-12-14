import axios from 'axios';

const API_URL = 'http://localhost:5001/api/ai';

/**
 * Generate AI-powered itinerary using Gemini
 * @param {Object} data - Itinerary generation parameters
 * @returns {Promise} Generated itinerary data
 */
export const generateAIItinerary = async (data) => {
  try {
    console.log('🤖 Calling AI API to generate itinerary...');
    console.log('Request data:', data);

    const response = await axios.post(`${API_URL}/generate-itinerary`, data, {
      timeout: 30000, // 30 second timeout for AI generation
    });

    console.log('✅ AI itinerary received from backend');
    return response.data;
  } catch (error) {
    console.error('❌ Error calling AI API:', error);
    
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Failed to generate itinerary');
    } else if (error.request) {
      // No response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Request setup error
      throw new Error(error.message || 'Failed to generate itinerary');
    }
  }
};
