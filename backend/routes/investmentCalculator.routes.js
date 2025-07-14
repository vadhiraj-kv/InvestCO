import express from 'express';
import * as investmentCalculatorController from '../controllers/investmentCalculator.controller.js';

const router = express.Router();

// Save investment calculator data
router.post('/save', investmentCalculatorController.saveInvestmentCalculator);

// Get investment calculator data by userId
router.get('/:userId', investmentCalculatorController.getInvestmentCalculator);

// Check if user has completed investment calculator
router.get('/status/:userId', investmentCalculatorController.checkInvestmentCalculatorStatus);

// Get user's complete profile (questions + calculator)
router.get('/profile/:userId', investmentCalculatorController.getUserCompleteProfile);

// Delete investment calculator data
router.delete('/:userId', investmentCalculatorController.deleteInvestmentCalculator);

export default router;
