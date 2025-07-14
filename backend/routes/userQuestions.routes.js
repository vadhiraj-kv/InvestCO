import express from 'express';
import * as userQuestionsController from '../controllers/userQuestions.controller.js';

const router = express.Router();

// Save user questions (survey answers)
router.post('/save', userQuestionsController.saveUserQuestions);

// Get user questions by userId
router.get('/:userId', userQuestionsController.getUserQuestions);

// Check if user has completed questions
router.get('/status/:userId', userQuestionsController.checkUserQuestionsStatus);

// Delete user questions
router.delete('/:userId', userQuestionsController.deleteUserQuestions);

export default router;
