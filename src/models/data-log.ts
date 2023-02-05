import mongoose from 'mongoose';

// An interface that describes the properties
// that are required to create a new User
interface DataLogAttrs {
  _id: String;
  lastUpdated: Date;
  previousTrainedTime: Date;
  newDataPoints: Number;
}

// An interface that describes the properties
// that a User Model has
interface DataLogModel extends mongoose.Model<DataLogDoc> {
  build(attrs: DataLogAttrs): DataLogDoc;
}

// An interface that describes the properties
// that a User Document has
interface DataLogDoc extends mongoose.Document {

    _id: String;
    lastUpdated: Date;
    previousTrainedTime: Date;
    newDataPoints: Number;
}

// make custom id field as _id
const dataLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    lastUpdated: {
      type: Date,
      required: true,
    },
    previousTrainedTime: {
      type: Date,
      required: true,
    },
    newDataPoints: {
      type: Number,
      required: true,
    }
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

dataLogSchema.pre('save', async function(done) {
  done();
});

dataLogSchema.statics.build = (attrs: DataLogAttrs) => {
  const buildAttrs = {
    ...attrs
  };
  return new DataLogs(buildAttrs);
};

const DataLogs = mongoose.model<DataLogDoc, DataLogModel>('DataLogs', dataLogSchema);

export { DataLogs };
