import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TCategory } from './category.interface';
import { Category } from './category.model';
import { ObjectId } from 'mongodb';

const createCategoryIntoDB = async (userId: string, payload: TCategory) => {
  const category = await Category.findOne({ name: payload.name });
  if (category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${payload.name} is already exists`,
    );
  }

  // Convert userId to ObjectId
  const createdByObjectId: ObjectId = new ObjectId(userId);
  payload.createdBy = createdByObjectId;

  const result = await Category.create(payload);
  return result;
};

const getAllCategory = async () => {
  const result = await Category.find().populate('createdBy');
  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategory,
};
