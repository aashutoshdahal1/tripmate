const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/user/:userId', getUserPosts);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);

module.exports = router;
