import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { CourseValidations } from './course.validation';
import { CourseControllers } from './course.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/course',
  auth('admin'),
  validateRequest(CourseValidations.courseValidationSchema),
  CourseControllers.createCourse,
);

router.put(
  '/courses/:courseId',
  auth('admin'),
  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse,
);

router.get('/courses/:courseId/reviews', CourseControllers.getCourseAndReviews);

router.get('/course/best', CourseControllers.getBestCourse);

router.get('/courses', CourseControllers.getCourses);

export const CourseRoutes = router;
