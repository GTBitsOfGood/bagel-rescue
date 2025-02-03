import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISignUpToken extends Document {
  email: string;
  token: string;
  expiration: Date;
}

const SignUpTokenSchema: Schema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiration: { type: Date, required: true },
});

export default mongoose.models?.SignUpToken ||
  mongoose.model<ISignUpToken>('SignUpToken', SignUpTokenSchema);