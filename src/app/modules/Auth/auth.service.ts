import config from '../../config';
import { TUser } from '../User/user.interface';
import bcrypt from 'bcrypt';
import { User } from '../User/user.model';

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

export const AuthServices = {
  createUserIntoDB,
};
