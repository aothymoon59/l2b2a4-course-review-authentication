export type TPasswordHistory = {
  password: string;
  createdAt?: Date;
};

export type TUser = {
  username: string;
  email: string;
  password: string;
  password_history: TPasswordHistory[];
  role: 'user' | 'admin';
};
