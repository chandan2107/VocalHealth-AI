import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  credits: number;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  credits: { type: Number, default: 5 },
});

const User = models.User || model<IUser>("User", UserSchema);

export default User;
