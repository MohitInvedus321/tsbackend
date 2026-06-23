import { model, Schema } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  access_token?: string;
  isActive: boolean;
  isDelete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { required: true, type: String, min: 3, trim: true },
    email: { required: true, type: String, trim: true },
    password: { required: true, type: String, select: false },
    access_token: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  },
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDelete: { $eq: false } } },
);
export const User = model<IUser>("user", userSchema);
