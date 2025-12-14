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

    // Determine if international travel
    const isInternational = distance > 2000;
    
    // Create detailed prompt for Gemini
    const prompt = `You are an expert travel planner. Generate a SHORT, REALISTIC travel itinerary based on the following:

**Trip Details:**
- From: Latitude ${userLocation.latitude}, Longitude ${userLocation.longitude}
- To: ${destinationName}${destinationAddress ? ` (${destinationAddress})` : ''}
- Distance: ${distance.toFixed(0)} km ${isInternational ? '(INTERNATIONAL TRIP)' : '(DOMESTIC/REGIONAL TRIP)'}
- Duration: ${duration || 'Calculate optimal (3-7 days recommended)'} days
- Budget Constraint: ${budget ? `NPR ${budget}` : 'Moderate'}
- Interests: ${interests && interests.length > 0 ? interests.join(', ') : 'General tourism'}
- Trip Type: ${tripType || 'leisure'}

**CRITICAL BUDGET RULES:**
${isInternational ? `
- International flights: NPR 80,000 - 150,000 return
- International hotels: NPR 8,000 - 15,000 per night
- Daily expenses abroad: NPR 5,000 - 12,000 per day
- Minimum realistic budget: NPR 200,000+ for ${distance.toFixed(0)}km
` : `
- Domestic/regional transport: NPR 2,000 - 20,000
- Accommodation: NPR 1,500 - 5,000 per night
- Daily expenses: NPR 1,000 - 3,000 per day
- Minimum realistic budget: NPR 15,000+
`}

**Requirements:**
1. Keep it SHORT - 3-5 activities per day maximum
2. Be REALISTIC about costs - DO NOT underestimate international travel
3. First day: Include realistic travel (${distance > 500 ? 'flight + transfer' : 'road journey'})
4. Middle days: ${interests && interests.length > 0 ? interests.join(', ') : 'sightseeing'} activities
5. Last day: Return journey
6. Use concise bullet points (1 line each)
7. Calculate ACCURATE budgets in NPR

**Output Format (STRICT JSON):**
{
  "duration": <number of days (3-7)>,
  "totalBudget": <REALISTIC total in NPR>,
  "itinerary": [
    {
      "day": 1,
      "title": "Brief title with emoji",
      "activities": "• Activity 1\\n• Activity 2\\n• Activity 3",
      "budget": <realistic daily budget in NPR>
    }
  ],
  "tips": ["Short tip 1", "Short tip 2", "Short tip 3"]
}

Generate REALISTIC, CONCISE itinerary now:`;

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
