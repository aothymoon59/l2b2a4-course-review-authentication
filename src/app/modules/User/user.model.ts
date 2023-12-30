import { Schema, model } from 'mongoose';
import { TPasswordHistory, TUser } from './user.interface';

const passwordHistorySchema = new Schema<TPasswordHistory>(
  {
    password: { type: String },
  },
  {
    timestamps: true,
    _id: false,
  },
);

const userSchema = new Schema<TUser>(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    password_history: { type: [passwordHistorySchema] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.password_history;

  return user;
};

export const User = model<TUser>('User', userSchema);
