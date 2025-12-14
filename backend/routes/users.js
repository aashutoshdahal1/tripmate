const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', protect, getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, getUserById);

module.exports = router;
