import mongoose from 'mongoose';

// this model will store time series data for pollution in a pollution collection

interface PollutionDataAttrs {
  recordedAt: Date;
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
  recordedAt: Date;

  data: {
    [key: string]: number;
  };
  uploadedBy: {
    type: 'sensor' | 'manual';
    id: string;
  };

  metadata: {
    dataSourceId: string;
    addedAt: Date;
  };

}

const pollutionDataSchema = new mongoose.Schema(
  {
    recordedAt: {
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
      dataSourceId: {
        type: String,
        required: true,
      },
      addedAt: {
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

pollutionDataSchema.statics.build = (attrs: PollutionDataAttrs) => {
  const newAttrs = {
    ...attrs,
    metadata: {
      dataSourceId: attrs.metadata.dataSourceId,
      addedAt: new Date(),
    },
  };
  return new PollutionData(newAttrs);
};

const PollutionData = mongoose.model<PollutionDataDoc, PollutionDataModel>('PollutionData', pollutionDataSchema);

export { PollutionData };
