import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get(
  '/api/pollution/dashboard/data/:dataSourceId',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    if (!req.currentUser) {
      throw new BadRequestError('User not found');
    }

    console.log(req.params.dataSourceId);
    const dataSource = await DataSource.findById(req.params.dataSourceId);

    if (!dataSource) {
      throw new BadRequestError('Data source not found');
    }

    // user should be either admin or dp-manager or creator of the data source
    // if not, throw an error
    // if (!req.currentUser.roles.admin
    //   && !req.currentUser.roles['manager']
    //   && !req.currentUser.roles['data-analyst']
    //   && !(req.currentUser.id in dataSource.admins)) {
    //   throw new BadRequestError('You do not have permission to view this data source');
    // }

    // get PageNumber and pageSize from query params
    // if not present, set default values
    // const pageNumber = req.query.page ? parseInt(req.query.page.toString()) : 1;
    // const pageSize = req.query.perPage ? parseInt(req.query.perPage.toString()) : 100;

    // get pollution data from database
    // filter duplicate data based on meta.addedAt and select one which is latest
    // use aggregation pipeline
    // sort in descending order of timestamp which is recordedAt field
    // skip and limit based on page number and page size
    // add id field which is _id field

    const stationData = await PollutionData.aggregate([
      {
        $match: {
          'metadata.dataSourceId': dataSource.id,
        },
      },
      {
        $sort: {
          'metadata.addedAt': -1,
        },
      },
      {
        $group: {
          _id: {
            recordedAt: '$recordedAt',
            sourceId: '$metadata.sourceId',
          },
          data: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
      {
        $sort: {
          recordedAt: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          data: 1,
          'metadata.addedAt': 1,
          recordedAt: 1,
        },
      },
    ]);

    console.log(stationData);
    const latestDate = stationData[0].recordedAt;
    console.log('new date', latestDate);

    const highLowData = await PollutionData.aggregate([
      {
        $match: {
          'metadata.dataSourceId': dataSource.id,
          recordedAt: new Date(latestDate),
        },
      },
      {
        $group: {
          _id: {
            recordedAt: '$recordedAt',
            sourceId: '$metadata.sourceId',
          },
          data: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $project: {
          'data.data.PM10': { $ifNull: ['$data.data.PM10', 'null'] },
          'data.data.SO2': { $ifNull: ['$data.data.SO2', 'null'] },
          'data.data.NO2': { $ifNull: ['$data.data.NO2', 'null'] },
          'data.data.Pb': { $ifNull: ['$data.data.Pb', 'null'] },
          'data.data.O3': { $ifNull: ['$data.data.O3', 'null'] },
          'data.data.PM25': { $ifNull: ['$data.data.PM2.5', 'null'] },
          _id: 1,
          'data.recordedAt': '$data.recordedAt',
          'data.metadata': '$data.metadata',
          'data.uploadedBy': '$data.uploadedBy',
          'data._id': '$data._id',
        },
      },
      {
        $project: {
          data: {
            $arrayElemAt: ['$data', 0],
          },
        },
      },
      {
        $set: {
          'low.PM10': {
            $min: '$data.data.PM10',
          },
          'low.SO2': {
            $min: '$data.data.SO2',
          },
          'low.NO2': {
            $min: '$data.data.NO2',
          },
          'low.O3': {
            $min: '$data.data.O3',
          },
          'low.Pb': {
            $min: '$data.data.Pb',
          },
          'low.PM25': {
            $min: '$data.data.PM25',
          },
          'high.PM10': {
            $max: '$data.data.PM10',
          },
          'high.SO2': {
            $max: '$data.data.SO2',
          },
          'high.NO2': {
            $max: '$data.data.NO2',
          },
          'high.O3': {
            $max: '$data.data.O3',
          },
          'high.Pb': {
            $max: '$data.data.Pb',
          },
          'high.PM25': {
            $max: '$data.data.PM25',
          },
        },
      },
      {
        $project: {
          _id: 0,
          high: 1,
          low: 1,
        },
      },
    ]);

    // send data as well as next page number and page size
    // if no more data, send null for next page number and page size

    let data: any = {};
    data['metrics'] = stationData[0]['data'];
    data['high'] = highLowData[0].high;
    data['low'] = highLowData[0].low;

    var todaysdate = new Date(new Date().setHours(0, 0, 0, 0));
    todaysdate = new Date(todaysdate.getTime() + 1000 * 60 * 30 * 11);
    var tomorrow = new Date(todaysdate.getTime() + 1000 * 60 * 60 * 24);

      const prediction_data = await PredictionData.aggregate([
        {
          $match: {
            'metadata.dataSourceId': req.params.dataSourceId,
            recordedAt: {
              $gte: todaysdate,
              $lte: tomorrow,
            },
          },
        },
      ]);
    console.log(prediction_data);
      if ( prediction_data.length != 0 ){
        data['metrics'] = prediction_data[0].data;
      }

    res.status(200).send(data);
  },
);

export { router as getDashboardDataRouter };
