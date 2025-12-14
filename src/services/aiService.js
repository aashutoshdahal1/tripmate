const API_URL = 'http://192.168.5.71:5001/api/ai';

/**
 * Generate AI-powered itinerary using Gemini
 * @param {Object} data - Itinerary generation parameters
 * @returns {Promise} Generated itinerary data
 */
export const generateAIItinerary = async (data) => {
  try {
    console.log('🤖 Calling AI API to generate itinerary...');
    console.log('Request data:', data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_URL}/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ AI itinerary received from backend:', result);
    return result;
  } catch (error) {
    console.error('❌ Error calling AI API:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. AI generation is taking too long.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Failed to generate itinerary');
    }
  }
};
