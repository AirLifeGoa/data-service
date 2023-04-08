import mongoose from 'mongoose';
import { generateRandomString } from '@airlifegoa/common';
import { tokenAttrs, tokenSchemaParams, tokenDoc } from './verification-token';

interface roleTokenAttrs extends tokenAttrs {
  forRole: string;
}

interface roleTokenModel extends mongoose.Model<roleTokenDoc> {
  build (attrs: roleTokenAttrs): roleTokenDoc;
}

interface roleTokenDoc extends tokenDoc {
  forRole: string;
}

const roleTokenSchema = new mongoose.Schema({
    ...tokenSchemaParams,
    forRole: {
      type: String,
      required: true,
    },
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

roleTokenSchema.statics.build = (attrs: roleTokenAttrs) => {
  const newAttrs = {
    ...attrs,
    isUsed: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    token: generateRandomString(),
  };

  return new RoleToken(newAttrs);

};

const RoleToken = mongoose
  .model<roleTokenDoc, roleTokenModel>
  ('roleToken', roleTokenSchema);

export { RoleToken };
