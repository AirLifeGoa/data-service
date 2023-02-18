import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import {BadRequestError, currentUser, requireAuth, validateRequest} from '@airlifegoa/common';

const router = express.Router();

const QueryList = {
    "avg_pipeline": [
        {
            $unwind: '$data',
        },
        {
            $project: {
                "data.data.PM10": { "$ifNull": [ "$data.data.PM10", 0 ] },
                "data.data.SO2": { "$ifNull": [ "$data.data.SO2", 0 ] },
                "data.data.NO2": { "$ifNull": [ "$data.data.NO2", 0 ] },
                "data.data.Pb": { "$ifNull": [ "$data.data.Pb", 0 ] },
                "data.data.O3": { "$ifNull": [ "$data.data.O3", 0 ] },
                "data.data.PM25": { "$ifNull": [ "$data.data.PM2.5", 0 ] },
                "_id": 1,
                "data.recordedAt": "$data.recordedAt",
                "data.metadata" : "$data.metadata",
                "data.uploadedBy": "$data.uploadedBy",
                "data._id": "$data._id",
            }
        },
        {
            $group: {
                _id: "$_id",
                "avgPM10": {$avg : "$data.data.PM10"},
                "avgSO2": {$avg : "$data.data.SO2"},
                "avgNO2": {$avg : "$data.data.NO2"},
                "avgO3": {$avg : "$data.data.O3"},
                "avgPM25": {$avg : "$data.data.PM25"},
                "avgPb": {$avg : "$data.data.Pb"},
                "data": {$first: "$$ROOT"}
              }
        },
        {
            $sort: {
              _id: 1,
            },
        },
        {
            $project:{
                "_id": 1,
                "data.recordedAt": "$data.data.recordedAt",
                "data.metadata" : "$data.data.metadata",
                "data.data": "$data.data.data",
                "data.uploadedBy": "$data.data.uploadedBy",
                "data._id": "$data.data._id",
                "avgPM10": 1,
                "avgSO2":1,
                "avgNO2": 1,
                "avgO3": 1,
                "avgPM25":1,
                "avgPb":1
              }
        },
        {
            $set: {
              "data.data.PM10" : "$avgPM10",
              "data.data.SO2" : "$avgSO2",
              "data.data.Pb" : "$avgPb",
              "data.data.PM25" : "$avgPM25",
              "data.data.O3" : "$avgO3",
              "data.data.NO2" : "$avgNO2",
            }
        },
        {
            $project: {
                "avgPM10":0,
                "avgPM25":0,
                "avgNO2":0,
                "avgSO2":0,
                "avgO3":0,
                "avgPb":0
            },
        },
        {
            $replaceRoot: {
              newRoot: '$data',
            },
        },
        {
            $project: {
              _id: 0,
              id: '$_id',
              timestamp: 1,
              data: 1,
              metadata: 1,
              recordedAt: 1,
              uploadedBy: 1,
            },
        }
    ],
    "min_pipeline":[
        {
            $project: {
                "data.data.PM10": { "$ifNull": [ "$data.data.PM10", "null" ] },
                "data.data.SO2": { "$ifNull": [ "$data.data.SO2", "null" ] },
                "data.data.NO2": { "$ifNull": [ "$data.data.NO2", "null" ] },
                "data.data.Pb": { "$ifNull": [ "$data.data.Pb", "null" ] },
                "data.data.O3": { "$ifNull": [ "$data.data.O3", "null" ] },
                "data.data.PM25": { "$ifNull": [ "$data.data.PM2.5", "null" ] },
                "_id": 1,
                "data.recordedAt": "$data.recordedAt",
                "data.metadata" : "$data.metadata",
                "data.uploadedBy": "$data.uploadedBy",
                "data._id": "$data._id",
           }
        },
        {
            $project:{
                data: {
                    "$arrayElemAt": [ "$data", 0 ]
                }
            }
        },
        {
            $set: {
                "data.recordedAt": {
                    "$arrayElemAt": [ "$data.recordedAt", 0 ]
                 },
                "data.metadata": {
                    "$arrayElemAt": [ "$data.metadata", 0 ]
                },
                "data.uploadedBy": {
                    "$arrayElemAt": [ "$data.uploadedBy", 0 ]
                },
                "data._id":{
                  "$arrayElemAt": ["$data._id",0]
                }
              }
        },
        {
            $set: {
                "minPM10": {
                  $min:"$data.data.PM10"
                },
                "minSO2": {
                  $min:"$data.data.SO2"
                },
                "minNO2": {
                  $min:"$data.data.NO2"
                }
                ,
                "minO3": {
                  $min:"$data.data.O3"
                },
                "minPb": {
                  $min:"$data.data.Pb"
                },
                "minPM25": {
                  $min:"$data.data.PM2.5"
                },
              }  
        },
        {
            $set: {
                "data.data.PM10" : "$minPM10",
                "data.data.SO2" : "$minSO2",
                "data.data.Pb" : "$minPb",
                "data.data.PM25" : "$minPM25",
                "data.data.O3" : "$minO3",
                "data.data.NO2" : "$minNO2",
              }
        },
        {
            $project:{
                "minPM10":0,
                "minSO2":0,
                "minPb":0,
                "minPM25":0,
                "minO3":0,
                "minNO2":0
            }
        },
        {
            $replaceRoot: {
              newRoot: '$data',
            },
        },
        {
            $project: {
              _id: 0,
              id: '$_id',
              timestamp: 1,
              data: 1,
              metadata: 1,
              recordedAt: 1,
              uploadedBy: 1,
            },
        }
    ],
    "max_pipeline":[
        {
            $project: {
                "data.data.PM10": { "$ifNull": [ "$data.data.PM10", "null" ] },
                "data.data.SO2": { "$ifNull": [ "$data.data.SO2", "null" ] },
                "data.data.NO2": { "$ifNull": [ "$data.data.NO2", "null" ] },
                "data.data.Pb": { "$ifNull": [ "$data.data.Pb", "null" ] },
                "data.data.O3": { "$ifNull": [ "$data.data.O3", "null" ] },
                "data.data.PM25": { "$ifNull": [ "$data.data.PM2.5", "null" ] },
                "_id": 1,
                "data.recordedAt": "$data.recordedAt",
                "data.metadata" : "$data.metadata",
                "data.uploadedBy": "$data.uploadedBy",
                "data._id": "$data._id",
           }
        },
        {
            $project:{
                data: {
                    "$arrayElemAt": [ "$data", 0 ]
                }
            }
        },
        {
            $set: {
                "data.recordedAt": {
                    "$arrayElemAt": [ "$data.recordedAt", 0 ]
                 },
                "data.metadata": {
                    "$arrayElemAt": [ "$data.metadata", 0 ]
                },
                "data.uploadedBy": {
                    "$arrayElemAt": [ "$data.uploadedBy", 0 ]
                },
                "data._id":{
                  "$arrayElemAt": ["$data._id",0]
                }
              }
        },
        {
            $set: {
                "maxPM10": {
                  $max:"$data.data.PM10"
                },
                "maxSO2": {
                  $max:"$data.data.SO2"
                },
                "maxNO2": {
                  $max:"$data.data.NO2"
                }
                ,
                "maxO3": {
                  $max:"$data.data.O3"
                },
                "maxPb": {
                  $max:"$data.data.Pb"
                },
                "maxPM25": {
                  $max:"$data.data.PM2.5"
                },
            }
        },
        {
            $set: {
                "data.data.PM10" : "$maxPM10",
                "data.data.SO2" : "$maxSO2",
                "data.data.Pb" : "$maxPb",
                "data.data.PM25" : "$maxPM25",
                "data.data.O3" : "$maxO3",
                "data.data.NO2" : "$maxNO2",
            }
        },
        {
            $project: {
                "maxPM10":0,
                "maxSO2":0,
                "maxPb":0,
                "maxPM25":0,
                "maxO3":0,
                "maxNO2":0
            }
        },
        {
            $replaceRoot: {
              newRoot: '$data',
            },
        },
        {
            $project: {
              _id: 0,
              id: '$_id',
              timestamp: 1,
              data: 1,
              metadata: 1,
              recordedAt: 1,
              uploadedBy: 1,
            },
        }
    ]
};

// url should contain optional query params pageNumber and pageSize
router.post(
  '/api/pollution/data/filter/:dataSourceId',
  [
    body('startDate').isDate().withMessage('start date should be in date format'),
    body('endDate').isDate().withMessage('start date should be in date format'),
    body('filter').isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('stats').isIn(['min', 'max', 'avg']),
  ],
  validateRequest,
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

    if (
      !req.currentUser.roles.admin &&
      !req.currentUser.roles['manager'] &&
      !req.currentUser.roles['data-analyst'] &&
      !(req.currentUser.id in dataSource.admins)
    ) {
      throw new BadRequestError('You do not have permission to view this data source');
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    var filterValue = req.body.filter;
    const query = req.body.stats;


    if (filterValue == 'weekly') {
      filterValue = { $week: '$recordedAt' };
    } else if (filterValue == 'monthly') {
      filterValue = { $month: '$recordedAt' };
    } else if (filterValue == 'yearly') {
      filterValue = { $year: '$recordedAt' };
    }
    
    console.log(filterValue);
    // get pollution data from database
    // filter duplicate data based on meta.addedAt and select one which is latest
    // use aggregation pipeline
    // sort in descending order of timestamp which is recordedAt field
    // skip and limit based on page number and page size
    // add id field which is _id field
    console.log('id ', typeof req.params.dataSourceId);
    console.log(startDate, endDate, filterValue);
    var pipeline: any[] = [
      {
        $match: {
          'metadata.dataSourceId': req.params.dataSourceId,
          recordedAt: {
            $gte: startDate,
            $lte: endDate,
          },
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
        $group: {
          _id: filterValue,
          data: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      }
    ];

    if (query === 'min') {
        pipeline = pipeline.concat(QueryList["min_pipeline"]);
    } else if (query === 'max') {
        pipeline = pipeline.concat(QueryList["max_pipeline"]);
    } else if (query === 'avg') {
      console.log('inside avg');
      // pipeline.push(QueryList.avg);
      pipeline = pipeline.concat(QueryList["avg_pipeline"]);
    }

    const pollutionData = await PollutionData.aggregate(pipeline);

    console.log(pollutionData.length);

    res.status(200).send({
      data: pollutionData,
    });
  },
);

export { router as getPollutionDataWithFilterRouter };
