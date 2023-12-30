import { Router } from 'express';
import { CategoryRoutes } from '../modules/Category/category.route';
import { CourseRoutes } from '../modules/Course/course.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { AuthRoutes } from '../modules/Auth/auth.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/',
    routes: CategoryRoutes,
  },
  {
    path: '/',
    routes: CourseRoutes,
  },
  {
    path: '/',
    routes: ReviewRoutes,
  },
  {
    path: '/auth',
    routes: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.routes));

export default router;
