import mongoose from 'mongoose';

import { Password } from '../services/password';

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
  appliedRole: string;
  firstName: string;
  lastName?: string;
  sub: boolean;
  areas: string[];
  lastSend: Date;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build (attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  roles: {
    admin?: boolean;
    user?: boolean;
    manager?: boolean;
    'dp-manager'?: boolean;
    'data-analyst'?: boolean;
  };
  appliedRoles: {
    admin?: boolean;
    user?: boolean;
    manager?: boolean;
    'dp-manager'?: boolean;
    'data-analyst'?: boolean;
  };

  emailVerified: boolean;
  firstName: string;
  lastName?: string;
  sub: boolean;
  areas: string[];
  lastSend: Date;
}

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: Map,
      of: Boolean,
      required: true,
    },
    appliedRoles: {
      // it is a map of string to boolean
      type: Map,
      of: Boolean,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    sub: {
      type: Boolean,
      required: true,
    },
    areas: {
      type: Array(String),
      required: true,
    },
    lastSend: {
      type: Date,
      required: true,
    }
  },
  {
    toJSON: {
      transform (doc, ret) {
        delete ret.password;

        delete ret.__v;

        ret.id = ret._id;
        delete ret._id;
      },
    },
  });

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  const buildAttrs = {
    ...attrs,
    emailVerified: false,
    appliedRoles: {
      user: true,
      admin: false,
      manager: false,
      'dp-manager': false,
      'data-analyst': false
    },
    roles: {
      user: false,
      admin: false,
      manager: false,
      'dp-manager': false,
      'data-analyst': false,
    },
  };
  return new User(buildAttrs);
};
const User = mongoose.model<UserDoc, UserModel>('newUser', userSchema);

export { User };
