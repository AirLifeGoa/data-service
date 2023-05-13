import mongoose from 'mongoose';
import { generateRandomString } from '@airlifegoa/common';
import { tokenAttrs, tokenSchemaParams, tokenDoc } from './verification-token';

interface verificationTokenAttrs extends tokenAttrs {
  email: string;
  userId: string;
}

interface verificationTokenModel extends mongoose.Model<verificationTokenDoc> {
  build (attrs: verificationTokenAttrs): verificationTokenDoc;
}

type verificationTokenDoc = tokenDoc

const verificationTokenSchema = new mongoose.Schema({
    ...tokenSchemaParams,
  },
  {
    toJSON: {
      transform (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  });

verificationTokenSchema.statics.build = (attrs: verificationTokenAttrs) => {
  const newAttrs = {
    ...attrs,
    isUsed: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    token: generateRandomString(),
  };

  return new VerificationToken(newAttrs);
};

const VerificationToken = mongoose
  .model<verificationTokenDoc, verificationTokenModel>
  ('EmailVerificationToken', verificationTokenSchema);

export { VerificationToken };
