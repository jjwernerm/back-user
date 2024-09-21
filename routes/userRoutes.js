import express from 'express';

import { 
  POSTcreateUser,
  POSTreadUser,
  // updateUser,
  // deleteUser,
  GETconfirmUser,
  GETdashboardUser,
  POSTrecoverPasswordEmail,
  GETrecoverPasswordToken,
  POSTrecoverPasswordNew,
} from '../controllers/userControllers.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// CRUD
router.post('/create', POSTcreateUser); // Public Routes
router.post('/loging', POSTreadUser); // Public Routes
// router.put('/update/:id', checkAuth, updateUser); // Private Routes
// router.delete('/delete/:id', checkAuth, deleteUser); // Private Routes

// Public Routes 
router.get('/confirm-user/:token', GETconfirmUser);

// Private Routes 
router.get('/dashboard', authMiddleware, GETdashboardUser);

// Public Routes 
router.post('/recover-password', POSTrecoverPasswordEmail);
router.get('/recover-password/:token', GETrecoverPasswordToken);
router.post('/recover-password/:token', POSTrecoverPasswordNew);

export default router;