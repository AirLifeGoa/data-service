import mongoose from 'mongoose';

// add date time field for knowing prediction date
interface PredictionAttrs {
  _id: string;
  recordedAt: Date;
  data: {};
  metadata: {
    modelName: string;
    dataSourceId: string;
    addedAt: Date;
  };
}

interface PredictionDataModel extends mongoose.Model<PredictionDataDataDoc> {
  build(attrs: PredictionAttrs): PredictionDataDataDoc;
}

interface PredictionDataDataDoc extends mongoose.Document {

  _id: string;
  data: {
    [key: string]: number;
  };
  metadata: {
    modelName: string;
    dataSourceId: string;
    addedAt: Date;
  };

}

const predictionDataSchema = new mongoose.Schema(
  {
    _id: String,
    data: {
      type: String,
      required: true,
    },
    metadata: {
      modelName: String,
      dataSourceId: String,
      addedAt: Date,
    }
  },
  {
    timeseries: {
      timeField: 'recordedAt',
      metaField: 'metaData',
      granularity: 'seconds',
    },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

predictionDataSchema.statics.build = (attrs: PredictionAttrs) => {
  const newAttrs = {
    ...attrs,
    metadata: {
      dataSourceId: attrs.metadata.dataSourceId,
      addedAt: new Date(),
      modelName: attrs.metadata.modelName
    },
  };
  return new PredictionData(newAttrs);
};

const PredictionData = mongoose.model<PredictionDataDataDoc, PredictionDataModel>('PredictionData', predictionDataSchema);

export { PredictionData };
