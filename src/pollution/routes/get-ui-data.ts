import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError } from '@airlifegoa/common';
import { ModelLogData } from '../models/model-logs';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/dashboard/data/:dataSourceId', async (req: Request, res: Response) => {
  const dataSource = await DataSource.findById(req.params.dataSourceId);

  if (!dataSource) {
    throw new BadRequestError('Data source not found');
  }

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
  if (stationData.length == 0) {
    var error_msg = 'Datasource pollution data not found';
    res.status(200).send(error_msg);
  }
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
        'data.data.PM25': { $ifNull: ['$data.data.PM25', 'null'] },
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
  if (highLowData.length == 0) {
    var error_msg = 'Datasource pollution data not found';
    res.status(200).send(error_msg);
  }
  let data: any = {};
  data['metrics'] = stationData[0]['data'];
  data['high'] = highLowData[0].high;
  data['low'] = highLowData[0].low;

  var tomorrow = new Date(new Date().setHours(0, 0, 0, 0));
  tomorrow = new Date(tomorrow.getTime() + 1000 * 60 * 30 * 59);
  var dayAfterTomorrow = new Date(tomorrow.getTime() + 1000 * 60 * 60 * 24);

   const ModelLogs = await ModelLogData.aggregate([
    {
        $facet : {
            pm10ModelLog: [{
                $match: {
                  'metadata.dataSourceId': req.params.dataSourceId,
                  'metadata.metric': "PM10"
                },
              },
              {
                $sort: {
                  recordedAt: -1,
                },
              },
              {
                $limit: 1,
            }],
            pm25ModelLog: [{
                $match: {
                  'metadata.dataSourceId': req.params.dataSourceId,
                  'metadata.metric': "PM25"
                },
              },
              {
                $sort: {
                  recordedAt: -1,
                },
              },
              {
                $limit: 1,
            }]
        }
    }
  ]);

  if (ModelLogs.length == 0) {
    data['prediction'] = null;
    res.status(200).send(data);
  }

  console.log('modelog ', ModelLogs[0].pm10ModelLog, ModelLogs[0].pm25ModelLog);

    const forecastsFOrTomorrow = await PredictionData.aggregate([
       { $facet:{
            PM10data: [
                {
                $match: {
                    "data.PM10": { $exists: true }
                    }
                },
                {
                $match: {
                    'metadata.dataSourceId': req.params.dataSourceId,
                    'metadata.modelName': ModelLogs[0].pm10ModelLog.length > 0 ? ModelLogs[0].pm10ModelLog[0].bestModel : "",
                    recordedAt: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow,
                },
            },
            },],
            PM25data: [
                {
                $match: {
                    'metadata.dataSourceId': req.params.dataSourceId,
                    'metadata.modelName':  ModelLogs[0].pm25ModelLog.length > 0 ? ModelLogs[0].pm25ModelLog[0].bestModel : "",
                    recordedAt: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow,
                },
            },
            }, {
                $match: {
                    "data.PM25": { $exists: true }
                    }
            },]    
        }}
    ]);
    console.log(forecastsFOrTomorrow[0].PM10data, forecastsFOrTomorrow[0].PM25data);

    var curr_dict = {};
    if (forecastsFOrTomorrow.length !==0){
        if (forecastsFOrTomorrow[0].PM10data.length !== 0){
            for(let i=0;i<forecastsFOrTomorrow.length; i++){
                curr_dict = Object.assign({}, curr_dict, forecastsFOrTomorrow[0].PM10data[i].data);
            }
        }
        if (forecastsFOrTomorrow[0].PM25data.length !== 0){
            for(let i=0;i<forecastsFOrTomorrow.length; i++){
                curr_dict = Object.assign({}, curr_dict, forecastsFOrTomorrow[0].PM25data[i].data);
            }
        }
    }
    data.prediction  = curr_dict

    res.status(200).send(data);
});

export { router as getDashboardDataRouter };
