const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/ai/generate-itinerary
 * @desc    Generate AI-powered travel itinerary using Gemini
 * @access  Public
 */
router.post('/generate-itinerary', async (req, res) => {
  try {
    const {
      userLocation,
      destinationLocation,
      distance,
      destinationName,
      destinationAddress,
      duration,
      budget,
      interests,
      tripType,
    } = req.body;

    // Validate required fields
    if (!userLocation || !destinationLocation || !distance || !destinationName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userLocation, destinationLocation, distance, destinationName',
      });
    }

    console.log('🤖 Generating AI itinerary with Gemini...');
    console.log('📍 From:', userLocation);
    console.log('📍 To:', destinationLocation, '-', destinationName);
    console.log('📏 Distance:', distance, 'km');
    console.log('🎯 Interests:', interests);
    console.log('💰 Budget:', budget);

    // Create detailed prompt for Gemini
    const prompt = `You are an expert travel planner. Generate a detailed, personalized travel itinerary based on the following information:

**Trip Details:**
- Starting Location: Latitude ${userLocation.latitude}, Longitude ${userLocation.longitude}
- Destination: ${destinationName}${destinationAddress ? ` (${destinationAddress})` : ''}
- Destination Coordinates: Latitude ${destinationLocation.latitude}, Longitude ${destinationLocation.longitude}
- Total Distance: ${distance.toFixed(0)} km
- Trip Duration: ${duration || 'Calculate optimal duration'} days
- Budget: ${budget ? `NPR ${budget}` : 'Moderate budget'}
- Interests: ${interests && interests.length > 0 ? interests.join(', ') : 'General exploration'}
- Trip Type: ${tripType || 'leisure'}

**Requirements:**
1. Create a day-by-day itinerary with the following structure for each day:
   - Day number
   - Day title (creative, with emoji)
   - Detailed activities (bullet points, specific timings, realistic activities)
   - Estimated budget for the day in NPR

2. First day should include realistic travel from starting location to destination (${distance > 500 ? 'by flight' : 'by road'})
3. Middle days should include activities based on interests: ${interests && interests.length > 0 ? interests.join(', ') : 'cultural exploration, local food, sightseeing'}
4. Last day should include return journey
5. Include specific local attractions, restaurants, and activities in ${destinationName}
6. Provide realistic time estimates for travel and activities
7. Budget should be realistic for Nepal (NPR currency)
8. Make it personal and engaging with practical tips

**Output Format (STRICT JSON):**
Return ONLY a valid JSON object with this exact structure, no additional text:
{
  "duration": <number of days>,
  "totalBudget": <total budget in NPR>,
  "itinerary": [
    {
      "day": 1,
      "title": "Day title with emoji",
      "activities": "• Activity 1\\n• Activity 2\\n• Activity 3...",
      "budget": <day budget in NPR>
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Generate the itinerary now:`;

    // Get Gemini model
    // Using gemini-2.5-flash (latest available model with quota)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('📝 Raw Gemini response:', text);

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let itineraryData;
    try {
      itineraryData = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Response text:', text);
      
      // Fallback: Try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate response structure
    if (!itineraryData.itinerary || !Array.isArray(itineraryData.itinerary)) {
      throw new Error('Invalid itinerary structure from AI');
    }

    console.log('✅ AI itinerary generated successfully!');
    console.log('📊 Days:', itineraryData.duration);
    console.log('💰 Total budget:', itineraryData.totalBudget);

    // Return the generated itinerary
    res.status(200).json({
      success: true,
      data: {
        duration: itineraryData.duration,
        totalBudget: itineraryData.totalBudget,
        itinerary: itineraryData.itinerary,
        tips: itineraryData.tips || [],
        generatedAt: new Date().toISOString(),
        source: 'gemini-ai',
      },
    });
  } catch (error) {
    console.error('❌ Error generating AI itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: error.message,
    });
  }
});

module.exports = router;
