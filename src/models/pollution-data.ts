import mongoose from 'mongoose';

// this model will store time series data for pollution in a pollution collection

interface PollutionDataAttrs {
  timestamp: Date;
  data: {
    [key: string]: number;
  };

  uploadedBy: {
    type: 'sensor' | 'manual';
    id: string;
  };

  metadata: {
    dataSourceId: string;
  };
}

interface PollutionDataModel extends mongoose.Model<PollutionDataDoc> {
  build(attrs: PollutionDataAttrs): PollutionDataDoc;
}

interface PollutionDataDoc extends mongoose.Document {
  timestamp: Date;
  data: {
    [key: string]: number;
  };
  uploadedBy: {
    type: 'sensor' | 'manual';
    id: string;
  };

  metadata: {
    dataSourceId: string;
  };
}

const pollutionDataSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },

    data: {
      type: Object,
      required: true,
    },

    uploadedBy: {
      type: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },

    metadata: {
      type: {
        dataSourceId: {
          type: String,
          required: true,
        },
      },
    },
  },
  {
    timeseries: {
      timeField: 'timestamp',
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

pollutionDataSchema.statics.build = (attrs: PollutionDataAttrs) => {
  console.log('attrs', attrs);
  return new PollutionData(attrs);
};

const PollutionData = mongoose.model<PollutionDataDoc, PollutionDataModel>('PollutionData', pollutionDataSchema);

export { PollutionData };
