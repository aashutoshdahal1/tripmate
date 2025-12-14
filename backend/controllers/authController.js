const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxztq9eu6',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { fullName, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        location: user.location,
        stats: user.stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        stats: user.stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        location: user.location,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, location, avatar, coverImage } = req.body;

    const fieldsToUpdate = {};
    if (fullName) fieldsToUpdate.fullName = fullName;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (location !== undefined) fieldsToUpdate.location = location;
    if (avatar) fieldsToUpdate.avatar = avatar;
    if (coverImage !== undefined) fieldsToUpdate.coverImage = coverImage;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        location: user.location,
        stats: user.stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete image from Cloudinary
// @route   POST /api/auth/delete-image
// @access  Private
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    console.log('🔵 DELETE IMAGE REQUEST RECEIVED');
    console.log('   Public ID:', publicId);
    console.log('   User:', req.user?.id);

    if (!publicId) {
      console.log('❌ No public ID provided');
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    console.log('🗑️ Attempting to delete from Cloudinary:', publicId);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('📦 Cloudinary response:', result);

    if (result.result === 'ok') {
      console.log('✅ Image deleted successfully');
      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        result: result.result,
      });
    } else if (result.result === 'not found') {
      console.log('⚠️ Image not found in Cloudinary (already deleted?)');
      return res.status(200).json({
        success: true,
        message: 'Image not found (may be already deleted)',
        result: result.result,
      });
    } else {
      console.log('❌ Failed to delete:', result.result);
      return res.status(400).json({
        success: false,
        message: 'Failed to delete image',
        result: result.result,
      });
    }
  } catch (error) {
    console.error('❌ ERROR deleting image from Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image',
      error: error.message,
    });
  }
};
