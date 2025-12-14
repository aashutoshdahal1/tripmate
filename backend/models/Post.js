const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  location: {
    name: {
      type: String,
      required: [true, 'Please add a location'],
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    address: String,
  },
  media: {
    type: {
      type: String,
      enum: ['video', 'image'],
      required: true,
    },
    url: {
      type: String,
      required: [true, 'Please add media URL'],
    },
    thumbnail: String,
    publicId: String, // Cloudinary public_id for deletion
    duration: Number, // Video duration in seconds
    width: Number,
    height: Number,
  },
  metadata: {
    capturedAt: Date,
    device: String,
    camera: String,
    iso: Number,
    aperture: String,
    shutterSpeed: String,
  },
  tripDetails: {
    duration: {
      type: Number, // in days
      required: true,
    },
    tripType: {
      type: String,
      enum: ['short', 'long'],
      default: 'short',
    },
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: 'NPR',
      },
      breakdown: {
        accommodation: { type: Number, default: 0 },
        food: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        activities: { type: Number, default: 0 },
      },
    },
    interests: [{
      type: String,
      enum: ['adventure', 'nature', 'culture', 'food', 'relaxation', 'photography'],
    }],
    itinerary: [{
      day: Number,
      title: String,
      activities: String,
      budget: Number,
    }],
  },
  vlogs: [{
    uri: String,
    thumbnail: String,
    duration: Number,
    publicId: String,
    title: String,
  }],
  stats: {
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  aiSuggestions: {
    itinerary: Boolean,
    budget: Boolean,
    tips: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get user posts with pagination
PostSchema.statics.getUserPosts = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId, status: 'published' })
    .populate('user', 'fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get feed posts
PostSchema.statics.getFeedPosts = async function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ status: 'published' })
    .populate('user', 'fullName avatar email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Post', PostSchema);
