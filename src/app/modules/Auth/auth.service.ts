import config from '../../config';
import { TUser } from '../User/user.interface';
import bcrypt from 'bcrypt';
import { User } from '../User/user.model';
import { TLoginUser } from './auth.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { createToken } from './auth.utils';

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
  const user = await User.findOne({ username: payload?.username }).select(
    '+password',
  );
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

export const AuthServices = {
  createUserIntoDB,
  loginUser,
};
