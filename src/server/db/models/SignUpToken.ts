import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISignUpToken extends Document {
  email: string;
  token: string;
  expiration: Date;
  used: boolean;
}

const SignUpTokenSchema: Schema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiration: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

export default mongoose.models?.SignUpToken ||
  mongoose.model<ISignUpToken>('SignUpToken', SignUpTokenSchema);