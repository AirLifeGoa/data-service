import mongoose from 'mongoose';
import { generateRandomString } from '@airlifegoa/common';
import { tokenAttrs, tokenSchemaParams, tokenDoc } from './verification-token';

interface passwordTokenAttrs extends tokenAttrs {
  email: string;
  userId: string;
}

interface passwordTokenModel extends mongoose.Model<passwordTokenDoc> {
  build (attrs: passwordTokenAttrs): passwordTokenDoc;
}

type passwordTokenDoc = tokenDoc

const passwordTokenSchema = new mongoose.Schema({
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

passwordTokenSchema.statics.build = (attrs: passwordTokenAttrs) => {
  const newAttrs = {
    ...attrs,
    isUsed: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    token: generateRandomString(),
  };

  return new PasswordToken(newAttrs);
};

const PasswordToken = mongoose
  .model<passwordTokenDoc, passwordTokenModel>
  ('passwordToken', passwordTokenSchema);

export { PasswordToken };
