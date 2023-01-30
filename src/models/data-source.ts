import mongoose from 'mongoose';

// An interface that describes the properties
// that are required to create a new User
interface DataSourceAttrs {
  _id: string;
  creator: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: 'sensor' | 'manual';
  description: string;
  metrics: string[];
  expectedFrequencySeconds: number;
  expectedFrequencyType: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
}

// An interface that describes the properties
// that a User Model has
interface DataSourceModel extends mongoose.Model<DataSourceDoc> {
  build(attrs: DataSourceAttrs): DataSourceDoc;
}

// An interface that describes the properties
// that a User Document has
interface DataSourceDoc extends mongoose.Document {

  _id: string;
  creator: string;
  admins: string[];
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: 'sensor' | 'manual';
  description: string;
  metrics: string[];
  expectedFrequencySeconds: number;
  expectedFrequencyType: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  secondsSinceLastUpdate?: number;
}

// make custom id field as _id
const dataSourceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    creator: {
      type: String,
      required: true,
    },
    admins: {
      type: [String],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metrics: {
      type: [String],
    },
    expectedFrequencySeconds: {
      type: Number,
      required: true,
    },
    expectedFrequencyType: {
      type: String,
      required: true,
    },
    secondsSinceLastUpdate: {
      type: Number,
      required: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

dataSourceSchema.pre('save', async function(done) {
  done();
});

dataSourceSchema.statics.build = (attrs: DataSourceAttrs) => {
  const buildAttrs = {
    ...attrs,
    admins: [attrs.creator],
    secondsSinceLastUpdate: 10 * 365 * 24 * 60 * 60,
  };
  return new DataSource(buildAttrs);
};
const DataSource = mongoose.model<DataSourceDoc, DataSourceModel>('DataPoint', dataSourceSchema);

export { DataSource };
