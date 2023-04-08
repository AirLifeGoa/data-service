import mongoose from 'mongoose';

interface tokenAttrs {
  email: string;
  userId: string;
}

interface tokenModel extends mongoose.Model<tokenDoc> {
  build (attrs: tokenAttrs): tokenDoc;
}

interface tokenDoc extends mongoose.Document {
  email: string;
  userId: string;
  token: string;
  isUsed: boolean;
  expiresAt: Date;
}

const tokenSchemaParams = {
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
};

export { tokenAttrs, tokenDoc, tokenModel, tokenSchemaParams };
