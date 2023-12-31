import { TReview } from './review.interface';
import { Review } from './review.model';
import { ObjectId } from 'mongodb';

const createReviewIntoDb = async (userId: string, payload: TReview) => {
  // Convert userId to ObjectId
  const createdByObjectId: ObjectId = new ObjectId(userId);
  payload.createdBy = createdByObjectId;

  const result = await Review.create(payload);
  return result.populate('createdBy');
};

export const ReviewServices = {
  createReviewIntoDb,
};
