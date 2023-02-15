import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import {BadRequestError, currentUser, requireAuth, validateRequest} from '@airlifegoa/common';

const router = express.Router();

const QueryList={
    "max": { $set:{
            PM10Data: { $sortArray: {
              input: "$PM10Data",
              sortBy: -1
            }},
            NO2Data: { $sortArray: {
              input: "$NO2Data",
              sortBy: -1
            }},
            SO2Data: { $sortArray: {
              input: "$SO2Data",
              sortBy: -1
            }},
            O3Data: { $sortArray: {
              input: "$o3",
              sortBy: -1
            }}}
        },
    "min" :{ $set:{
            PM10Data: { $sortArray: {
              input: "$PM10Data",
              sortBy: 1
            }},
            NO2Data: { $sortArray: {
              input: "$NO2Data",
              sortBy: 1
            }},
            SO2Data: { $sortArray: {
              input: "$SO2Data",
              sortBy: 1
            }},
            O3Data: { $sortArray: {
              input: "$o3",
              sortBy: 1
            }}}
        },

    "avg":{ $project:{
            PM10Data: {$avg: "$PM10Data"
              
            },
            NO2Data: { $avg : "$NO2Data"},
            SO2Data: { $avg : "$SO2Data"},
            O3Data: { $avg : "$O3Data"}
          }}
}


// url should contain optional query params pageNumber and pageSize
router.post(
  '/api/pollution/data/filter/:dataSourceId',
  [
    body('startDate').isDate().withMessage('start date should be in date format'),
    body('endDate').isDate().withMessage('start date should be in date format'),
    body('filter').isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('stats').isIn(["min","max","avg"])
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
    var filterValue  = req.body.filter;
    const query = req.body.query; 

    if (filterValue == "weekly"){
        filterValue= { $week : '$recordedAt'};
    }   
    else if (filterValue == "monthly"){
        filterValue={ $month : '$recordedAt'};
    }
    else if (filterValue == "yearly"){
        filterValue={ $year : '$recordedAt'};
    }

    console.log(filterValue);
    // get pollution data from database
    // filter duplicate data based on meta.addedAt and select one which is latest
    // use aggregation pipeline
    // sort in descending order of timestamp which is recordedAt field
    // skip and limit based on page number and page size
    // add id field which is _id field
    console.log("id ",typeof req.params.dataSourceId)
    console.log(startDate, endDate, filterValue)
    const pipeline: any[] = [
      {
        $match: {
            'metadata.dataSourceId': req.params.dataSourceId,
            recordedAt: {
                $gte: startDate ,
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
            PM10Data: {$push : "$data.PM10"},
            SO2Data: {$push : "$data.SO2"},
            NO2Data: {$push : "$data.NO2"}
        }
      },
      {
        $sort:{
            _id: 1
        }
      }
      
    ];
   
    if (query === "min"){
        pipeline.push(QueryList.min);
        pipeline.push({$set:{
            PM10Data: {"$first": "$PM10Data"},
            NO2Data: {"$first": "$SO2Data"},
            SO2Data: {"$first": "$NO2Data"},
            O3Data:  {"$first": "$O3Data"}
          }})
    }
    else if (query === "max"){
        pipeline.push(QueryList.max);
        pipeline.push({$set:{
            PM10Data: {"$first": "$PM10Data"},
            NO2Data: {"$first": "$SO2Data"},
            SO2Data: {"$first": "$NO2Data"},
            O3Data:  {"$first": "$O3Data"}
        }})
    }
    else if (query === "avg"){
        pipeline.push(QueryList.avg);
        
    }
    const pollutionData = await PollutionData.aggregate(pipeline)

    console.log( pollutionData.length);

    res.status(200).send({
      data: pollutionData,
    });
  },
);

export { router as getPollutionDataWithFilterRouter };
