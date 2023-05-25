import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get(
  '/api/pollution/dashboard/allstationsdata',
  async (req: Request, res: Response) => {

    // get pollution data from database
    // filter duplicate data based on meta.addedAt and select one which is latest
    // use aggregation pipeline
    // sort in descending order of timestamp which is recordedAt field
    // skip and limit based on page number and page size
    // add id field which is _id field

    const pipeline = [
      {
        $group: {
          _id: {
            recordedAt: '$recordedAt',
            sourceId: '$metadata.dataSourceId',
          },
          data: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $group: {
          _id: '$data.metadata.dataSourceId',
          data: {
            $push: '$data',
          },
        },
      },
      {
        $set: {
          data: {
            $sortArray: {
              input: '$data',
              sortBy: {
                recordedAt: 1,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          data: 1,
          latestDate: {
            $last: '$data.recordedAt',
          },
        },
      },
      {
        $project: {
          _id: 1,
          data: 1,
          latestDate: {
            $dateToString: {
              format: '%Y-%m-%dT00:00:00.000Z',
              date: '$latestDate',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          data: 1,
          latestDate: {
            $toDate: '$latestDate',
          },
        },
      },
      {
        $project: {
          _id: 1,
          data: {
            $filter: {
              input: '$data',
              as: 'd',
              cond: {
                $gte: ['$$d.recordedAt', '$latestDate'],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          PM10Array: {
            $push: '$data.data.PM10',
          },
          PM25Array: {
            $push: '$data.data.PM10',
          },
          SO2Array: {
            $push: '$data.data.PM10',
          },
          NO2Array: {
            $push: '$data.data.PM10',
          },
          AQIArray: {
            $push: '$data.data.PM10',
          },
          PbArray: {
            $push: '$data.data.PM10',
          },
          O3Array: {
            $push: '$data.data.PM10',
          },
        },
      },
      {
        $project: {
          _id: 1,
          PM10: {
            $arrayElemAt: ['$PM10Array', 0],
          },
          PM25: {
            $arrayElemAt: ['$PM25Array', 0],
          },
          SO2: {
            $arrayElemAt: ['$SO2Array', 0],
          },
          NO2: {
            $arrayElemAt: ['$NO2Array', 0],
          },
          Pb: {
            $arrayElemAt: ['$PbArray', 0],
          },
          O3: {
            $arrayElemAt: ['$O3Array', 0],
          },
          AQI: {
            $arrayElemAt: ['$AQIArray', 0],
          },
        },
      },
      {
        $set: {
          'low.PM10': {
            $min: '$PM10',
          },
          'low.SO2': {
            $min: '$SO2',
          },
          'low.NO2': {
            $min: '$NO2',
          },
          'low.O3': {
            $min: '$O3',
          },
          'low.Pb': {
            $min: '$Pb',
          },
          'low.PM25': {
            $min: '$PM25',
          },
          'high.PM10': {
            $max: '$PM10',
          },
          'high.SO2': {
            $max: '$SO2',
          },
          'high.NO2': {
            $max: '$NO2',
          },
          'high.O3': {
            $max: '$O3',
          },
          'high.Pb': {
            $max: '$Pb',
          },
          'high.PM25': {
            $max: '$PM25',
          },
        },
      },
      {
        $project: {
          low: 1,
          high: 1,
        },
      },
    ];

    const highLowData = await PollutionData.aggregate(pipeline);

    res.status(200).send(highLowData);
  },
);

export { router as getAllStationDashboardDataRouter };
