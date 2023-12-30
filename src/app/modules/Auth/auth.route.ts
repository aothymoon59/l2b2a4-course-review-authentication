import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userValidations } from './auth.validation';
import { AuthControllers } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  validateRequest(userValidations.userRegistrationValidationSchema),
  AuthControllers.createUser,
);

export const AuthRoutes = router;
