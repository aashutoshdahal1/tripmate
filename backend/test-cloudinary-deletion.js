/**
 * Test Script for Cloudinary Image Deletion
 * 
 * This script helps test if the deletion is working correctly.
 * Run this in Node.js terminal in backend folder.
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('=== Cloudinary Configuration Test ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('');

/**
 * Test 1: List recent images
 */
async function listRecentImages() {
  console.log('=== Test 1: Listing Recent Images ===');
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 10,
    });
    
    console.log(`Found ${result.resources.length} images:`);
    result.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id}`);
      console.log(`   URL: ${resource.secure_url}`);
      console.log(`   Created: ${resource.created_at}`);
    });
    
    return result.resources;
  } catch (error) {
    console.error('❌ Error listing images:', error.message);
    return [];
  }
}

/**
 * Test 2: Delete a specific image
 */
async function testDeleteImage(publicId) {
  console.log('\n=== Test 2: Deleting Image ===');
  console.log('Public ID:', publicId);
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Result:', result);
    
    if (result.result === 'ok') {
      console.log('✅ Image deleted successfully!');
    } else if (result.result === 'not found') {
      console.log('⚠️ Image not found (may be already deleted)');
    } else {
      console.log('❌ Deletion failed:', result.result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  }
}

/**
 * Test 3: Extract public_id from URL
 */
function extractPublicId(imageUrl) {
  console.log('\n=== Test 3: Extract Public ID from URL ===');
  console.log('URL:', imageUrl);
  
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    console.log('❌ Not a Cloudinary URL');
    return null;
  }

  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      console.log('❌ Could not find "upload" in URL');
      return null;
    }

    // Get everything after 'upload/v{version}/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    console.log('✅ Extracted Public ID:', publicId);
    return publicId;
  } catch (error) {
    console.error('❌ Error extracting public_id:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Cloudinary Tests\n');
  
  // Test 1: List images
  const images = await listRecentImages();
  
  // Test 3: Extract public_id from a sample URL
  if (images.length > 0) {
    const sampleUrl = images[0].secure_url;
    const publicId = extractPublicId(sampleUrl);
    
    // Test 2: Delete (commented out for safety)
    // Uncomment to actually test deletion
    // if (publicId) {
    //   await testDeleteImage(publicId);
    // }
  }
  
  // Test with your actual image URL
  console.log('\n=== Test with Your Image ===');
  console.log('To test deletion with your actual image:');
  console.log('1. Copy an image URL from your Cloudinary dashboard');
  console.log('2. Run: testDeleteImage(extractPublicId("YOUR_IMAGE_URL"))');
  console.log('\nExample:');
  console.log('const url = "https://res.cloudinary.com/dxztq9eu6/image/upload/v1234567890/photo_1234.jpg";');
  console.log('const publicId = extractPublicId(url);');
  console.log('await testDeleteImage(publicId);');
}

// Run the tests
runTests().catch(console.error);

// Export functions for manual testing
module.exports = {
  listRecentImages,
  testDeleteImage,
  extractPublicId,
};
