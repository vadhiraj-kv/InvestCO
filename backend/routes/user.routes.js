import express from 'express';

import * as userController from '../controllers/user.controller.js';

const router = express.Router();
// Register new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user profile
router.get('/profile/:id', userController.getUserProfile);

router.get('/all', userController.getAllUsers);

export default router;