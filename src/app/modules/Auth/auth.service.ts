/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config';
import { TUser } from '../User/user.interface';
import bcrypt from 'bcrypt';
import { User } from '../User/user.model';
import { TChangeUserPassword, TLoginUser } from './auth.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { createToken } from './auth.utils';
import { Response } from 'express';
import moment from 'moment';
import sendResponse from '../../utils/sendResponse';

const createUserIntoDB = async (payload: TUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  payload.password = hashedPassword;
  payload.password_history = [{ password: hashedPassword }];

  const result = await User.create(payload);

  return result;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.findOne({ username: payload?.username })
    .select('+password')
    .select({ createdAt: 0, updatedAt: 0, __v: 0 });
  // checking if the user is exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is matched or not
  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched !');
  }

  const jwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    user,
    token,
  };
};

const changeUserPasswordFromDB = async (
  res: Response,
  userId: string,
  payload: TChangeUserPassword,
) => {
  const user = await User.findById(userId).select('+password');

  // checking if the user is exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is matched or not
  const isPasswordMatched = await bcrypt.compare(
    payload?.currentPassword,
    user?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched !');
  }

  const lastTwoPasswordsAndCurrent = user.password_history.slice(-3);

  const isPasswordRepeated = lastTwoPasswordsAndCurrent.some((history) => {
    return bcrypt.compareSync(payload?.newPassword, history.password);
  });

  if (isPasswordRepeated) {
    const lastUseData: any = lastTwoPasswordsAndCurrent.find((history) => {
      return bcrypt.compareSync(payload?.newPassword, history.password);
    });

    const formattedLastUsedDate = lastUseData
      ? moment(lastUseData.createdAt).format('YYYY-MM-DD [at] hh-mm A')
      : '';

    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: `Password change failed. Ensure the new password is unique and not among the last 2 used (last used on ${formattedLastUsedDate}).`,
      data: null,
    });
  }
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const newPasswordObject = {
    password: hashedPassword,
  };

  const result = await User.findByIdAndUpdate(userId, {
    $set: { password: hashedPassword },
    $push: { password_history: newPasswordObject },
  });

  return result;
};

export const AuthServices = {
  createUserIntoDB,
  loginUser,
  changeUserPasswordFromDB,
};
