const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    console.log('📝 CREATE POST REQUEST:', {
      userId: req.user._id,
      body: req.body,
    });

    const {
      title,
      description,
      location,
      media,
      metadata,
      tripDetails,
      isAIGenerated,
      aiSuggestions,
    } = req.body;

    // Validate required fields
    if (!title || !location || !media || !tripDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, location, media, and trip details',
      });
    }

    // Create post
    const post = await Post.create({
      user: req.user._id,
      title,
      description,
      location,
      media,
      metadata,
      tripDetails,
      isAIGenerated: isAIGenerated || false,
      aiSuggestions,
    });

    // Populate user data
    await post.populate('user', 'fullName avatar email');

    console.log('✅ POST CREATED:', post._id);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('❌ CREATE POST ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post',
    });
  }
};

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.getFeedPosts(page, limit);
    const total = await Post.countDocuments({ status: 'published' });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ GET POSTS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get posts',
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'fullName avatar email bio location');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    post.stats.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('❌ GET POST ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get post',
    });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.params.userId;

    const posts = await Post.getUserPosts(userId, page, limit);
    const total = await Post.countDocuments({ 
      user: userId, 
      status: 'published' 
    });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ GET USER POSTS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user posts',
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'fullName avatar email');

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('❌ UPDATE POST ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update post',
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Delete media from Cloudinary
    if (post.media.publicId) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image',
        });
        console.log('🗑️ MEDIA DELETED FROM CLOUDINARY:', post.media.publicId);
      } catch (cloudinaryError) {
        console.error('⚠️ CLOUDINARY DELETE ERROR:', cloudinaryError);
        // Continue with post deletion even if Cloudinary fails
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('❌ DELETE POST ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete post',
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;
    const likedIndex = post.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      // Unlike
      post.likedBy.splice(likedIndex, 1);
      post.stats.likes = Math.max(0, post.stats.likes - 1);
    } else {
      // Like
      post.likedBy.push(userId);
      post.stats.likes += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        isLiked: likedIndex === -1,
        likes: post.stats.likes,
      },
    });
  } catch (error) {
    console.error('❌ TOGGLE LIKE ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle like',
    });
  }
};

// @desc    Save/Unsave post
// @route   POST /api/posts/:id/save
// @access  Private
exports.toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;
    const savedIndex = post.savedBy.indexOf(userId);

    if (savedIndex > -1) {
      // Unsave
      post.savedBy.splice(savedIndex, 1);
      post.stats.saves = Math.max(0, post.stats.saves - 1);
    } else {
      // Save
      post.savedBy.push(userId);
      post.stats.saves += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        isSaved: savedIndex === -1,
        saves: post.stats.saves,
      },
    });
  } catch (error) {
    console.error('❌ TOGGLE SAVE ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle save',
    });
  }
};
