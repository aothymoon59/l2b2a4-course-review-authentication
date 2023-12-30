export type TUserRole = 'user' | 'admin';

export type TLoginUser = {
  username: string;
  password: string;
};

export type TChangeUserPassword = {
  currentPassword: string;
  newPassword: string;
};
