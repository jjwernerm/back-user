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

// Public Routes
router.post('/loging', POSTreadUser);
router.post('/create', POSTcreateUser);
router.get('/confirm-user/:token', GETconfirmUser);
router.post('/recover-password', POSTrecoverPasswordEmail);
router.get('/recover-password/:token', GETrecoverPasswordToken);
router.post('/recover-password/:token', POSTrecoverPasswordNew);

// Private Routes 
router.get('/dashboard', authMiddleware, GETdashboardUser);

// router.put('/update/:id', checkAuth, updateUser); // Private Routes
// router.delete('/delete/:id', checkAuth, deleteUser); // Private Routes

export default router;