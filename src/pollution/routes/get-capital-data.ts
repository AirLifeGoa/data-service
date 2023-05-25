import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { ModelLogData } from '../models/model-logs';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/dashboard/capital', async (req: Request, res: Response) => {

  const panji_stattion_details = await DataSource.aggregate([
    {
      $match: {
        name: 'Panji',
      },
    },
  ]);

  // get pollution data from database
  // filter duplicate data based on meta.addedAt and select one which is latest
  // use aggregation pipeline
  // sort in descending order of timestamp which is recordedAt field
  // skip and limit based on page number and page size
  // add id field which is _id field

  const pipeline: any = [
      {
        $match: {
          'metadata.dataSourceId': panji_stattion_details[0]._id,
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $group: {
          _id: {
            timestamp: '$recordedAt',
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
        $limit: 7,
      },
  ];

  const highLowData = await PollutionData.aggregate(pipeline);

  const data: any = { AQI: [], data: {} };

  for (let i = 0; i < highLowData.length; i++) {
    data.AQI.push(highLowData[i].data.AQI);
  }
  data.data = highLowData[0].data;

  var tomorrow = new Date(new Date().setHours(0, 0, 0, 0));
  tomorrow = new Date(tomorrow.getTime() + 1000 * 60 * 30 * 59);
  var dayAfterTomorrow = new Date(tomorrow.getTime() + 1000 * 60 * 60 * 24);

  console.log(tomorrow, dayAfterTomorrow);


const ModelLogs = await ModelLogData.aggregate([
    {
        $facet : {
            pm10ModelLog: [{
                $match: {
                  'metadata.dataSourceId': panji_stattion_details[0]._id,
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
                  'metadata.dataSourceId': panji_stattion_details[0]._id,
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
                    'metadata.dataSourceId': panji_stattion_details[0]._id,
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
                    'metadata.dataSourceId': panji_stattion_details[0]._id,
                    'metadata.modelName': ModelLogs[0].pm25ModelLog.length > 0 ? ModelLogs[0].pm25ModelLog[0].bestModel : "",
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
    data.forecastsForTomorrow  = curr_dict

  res.status(200).send(data);
});

export { router as getCapitalDataRouter };
