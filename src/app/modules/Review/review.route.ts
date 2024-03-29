import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidations } from './review.validation';
import { ReviewControllers } from './review.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/reviews',
  auth('user'),
  validateRequest(ReviewValidations.reviewValidationSchema),
  ReviewControllers.createReview,
);

// router.get('/courses', CourseControllers.getCourses);

export const ReviewRoutes = router;
