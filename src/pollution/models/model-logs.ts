import mongoose from 'mongoose';

// this model will store time series data for pollution in a pollution collection

interface ModelLogDataAttrs {
  recordedAt: Date;
  data: {
    [key: string]: number;
  };

  metadata: {
    dataSourceId: string;
    lastTrainingPoint: Date
  };
  bestModel: string;
}

interface ModelLogDataModel extends mongoose.Model<ModelLogDataDoc> {
  build(attrs: ModelLogDataAttrs): ModelLogDataDoc;
}

interface ModelLogDataDoc extends mongoose.Document {
    recordedAt: Date;
    data: {
      [key: string]: number;
    };
  
    metadata: {
      dataSourceId: string;
      lastTrainingPoint: Date
    };
    bestModel: string;

}

const ModelLogDataSchema = new mongoose.Schema(
  {
    recordedAt: {
      type: Date,
      required: true,
    },
    

    data: {
      type: Object,
      required: true,
    },

    metadata: {
      dataSourceId: {
        type: String,
        required: true,
      },
      lastTrainingPoint: {
        type: Date,
        required: true,
      },
    },
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

ModelLogDataSchema.statics.build = (attrs: ModelLogDataAttrs) => {
  const newAttrs = {
    ...attrs,
    metadata: {
      dataSourceId: attrs.metadata.dataSourceId,
      lastTrainingPoint: new Date(),
    },
  };
  return new ModelLogData(newAttrs);
};

const ModelLogData = mongoose.model<ModelLogDataDoc, ModelLogDataModel>('modellogs', ModelLogDataSchema);

export { ModelLogData };
