/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { TCourse } from './course.interface';
import { Course } from './course.model';
import AppError from '../../errors/AppError';
import { weeksBetweenDates } from './course.utils';
import { TQuery } from '../../interface/query.interface';
import makeQuery from '../../utils/makeQuery';
import { Review } from '../Review/review.model';
import { ObjectId } from 'mongodb';
import { User } from '../User/user.model';

// create course
const createCourseIntoDB = async (userId: string, payload: TCourse) => {
  const course = await Course.findOne({ title: payload.title });
  if (course) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${payload.title} is already exists`,
    );
  }

  payload.durationInWeeks = weeksBetweenDates(
    payload.startDate,
    payload.endDate,
  );

  // Convert userId to ObjectId
  const createdByObjectId: ObjectId = new ObjectId(userId);
  payload.createdBy = createdByObjectId;

  const result = await Course.create(payload);
  return result;
};

// get all courses
const getCoursesFromDb = async (query: TQuery) => {
  const { filter, sort, skip, limit, meta } = await makeQuery<any>(
    query,
    Course,
  );

  const courses = await Course.find(filter)
    .populate('categoryId')
    .populate('createdBy')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // remove deleted tags => isDeleted:true
  courses.forEach((course) => {
    course.tags = course.tags.filter((tag) => !tag.isDeleted);
  });

  return { courses, meta };
};

// update course
const updateCourseIntoDb = async (courseId: string, payload: TCourse) => {
  const {
    details,
    startDate,
    endDate,
    durationInWeeks,
    tags,
    ...remainingCourseData
  } = payload;
  const course = await Course.findById(courseId).populate('createdBy');
  if (!course) {
    return new AppError(httpStatus.BAD_REQUEST, 'Course not found');
  }
  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingCourseData,
  };

  if (durationInWeeks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'duration week cannot update directly need to update startDate and endDate',
    );
  }
  if (startDate && endDate) {
    modifiedUpdatedData.durationInWeeks = weeksBetweenDates(
      payload.startDate,
      payload.endDate,
    );
  } else if (startDate) {
    modifiedUpdatedData.durationInWeeks = weeksBetweenDates(
      payload.startDate,
      course.endDate,
    );
  } else if (endDate) {
    modifiedUpdatedData.durationInWeeks = weeksBetweenDates(
      course.startDate,
      payload.endDate,
    );
  }
  if (details && Object.keys(details).length) {
    for (const [key, value] of Object.entries(details)) {
      modifiedUpdatedData[`details.${key}`] = value;
    }
  }

  type TTag = { name: string; isDeleted: boolean };
  const previousTag: TTag[] = course?.tags ? [...course.tags] : [];
  if (tags && tags.length) {
    tags.forEach((tag: TTag) => {
      const index = previousTag.findIndex((item) => item.name === tag.name);
      if (index !== -1) {
        previousTag[index] = tag;
      } else {
        previousTag.push(tag);
      }
    });
  }

  modifiedUpdatedData.tags = previousTag;

  const result = await Course.findByIdAndUpdate(courseId, modifiedUpdatedData, {
    new: true,
  }).populate('createdBy');

  return result;
};

// Get Course by ID with Reviews
const getCourseAndReviewsFromDb = async (courseId: string) => {
  const course = await Course.findById(courseId).populate('createdBy');
  const reviews = await Review.find({
    courseId: new ObjectId(courseId),
  }).populate('createdBy');

  return { course, reviews };
};

const getBestCourseFromDb = async () => {
  const bestCourses = await Course.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'courseId',
        as: 'reviews',
      },
    },
    {
      $match: {
        'reviews.rating': { $gt: 0 },
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    {
      $sort: {
        averageRating: -1,
      },
    },
    {
      $limit: 1,
    },
  ]).exec();

  const course = bestCourses[0];
  const createdBy = await User.findById(course?.createdBy?.toString()).select(
    'username email role',
  );
  const bestCourse = {
    averageRating: parseFloat(course?.averageRating?.toFixed(1)),
    reviewCount: course?.reviewCount,
    course: { ...course, createdBy },
  };

  delete bestCourse.course.reviews;
  delete bestCourse.course.averageRating;
  delete bestCourse.course.reviewCount;

  bestCourse.course.tags = bestCourse.course.tags.filter(
    (tag: any) => !tag.isDeleted,
  );

  return bestCourse;
};

export const CourseServices = {
  createCourseIntoDB,
  getCoursesFromDb,
  updateCourseIntoDb,
  getCourseAndReviewsFromDb,
  getBestCourseFromDb,
};
