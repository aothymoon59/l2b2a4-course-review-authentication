import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userValidations } from './auth.validation';
import { AuthControllers } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  validateRequest(userValidations.userRegistrationValidationSchema),
  AuthControllers.createUser,
);

router.post(
  '/login',
  validateRequest(userValidations.userLoginValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  '/change-password',
  auth('user', 'admin'),
  validateRequest(userValidations.userChangePasswordValidationSchema),
  AuthControllers.changeUserPassword,
);

export const AuthRoutes = router;
