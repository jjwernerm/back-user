import express from 'express';

import {
  // Public Area 
  POSTcreateUser,
  POSTreadUser,
  GETconfirmUser,  
  POSTrecoverPasswordEmail,
  GETrecoverPasswordToken,
  POSTrecoverPasswordNew,

  // Private Area
  GETdashboardUser,
  GETuserInformation,
  PUTupdateUser,
  POSTverifyPassword,
  PUTupdatePassword,
  DELETEdeleteUser,  
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
router.get('/information/:id', authMiddleware, GETuserInformation); 
router.put('/update/:id', authMiddleware, PUTupdateUser);
router.post('/verify-password/:id', authMiddleware, POSTverifyPassword);
router.put('/update-password/:id', authMiddleware, PUTupdatePassword);
router.delete('/delete/:id', authMiddleware, DELETEdeleteUser);

export default router;