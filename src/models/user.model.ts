// src/models/user.model.ts

import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    age: {
      type: Number,
      min: 0,
      max: 130,
      validate: {
        validator: (value: number) =>
          Number.isInteger(value),
        message: "Age must be an integer",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  { email: 1 },
  { unique: true },
);

export const User = model<IUser>("User", userSchema);