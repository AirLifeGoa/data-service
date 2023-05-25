import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';
import { monthlyMissingDataPipeline } from './aggregate-pipelines/monthly-missing-data-aggregate';
import { yearlyMissingDataPipeline } from './aggregate-pipelines/yearly-missing-data-aggregate';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get(
  '/api/pollution/missingdata/:dataSourceId',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    if (!req.currentUser) {
      throw new BadRequestError('User not found');
    }

    const dataSource = await DataSource.findById(req.params.dataSourceId);

    if (!dataSource) {
      throw new BadRequestError('Data source not found');
    }

    const intervalList: any = ['monthly', 'yearly'];
    const missingInterval = req.query.interval;

    if (!intervalList.includes(missingInterval)) {
    }

    // get pollution data from database
    // filter duplicate data based on timestamp and metadata.sourceId
    // give data from start date to end date
    // use aggregation pipeline

    var pipeline = [
      {
        $match: {
          'metadata.dataSourceId': dataSource.id,
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
        $project: {
          __v: 0,
        },
      },
    ];

    if (missingInterval == 'monthly') {
      pipeline = pipeline.concat(monthlyMissingDataPipeline);
    }

    if (missingInterval == "yearly"){
        pipeline = pipeline.concat(yearlyMissingDataPipeline)
    }

    // send data as well as next page number and page size
    // if no more data, send null for next page number and page size

    const pollutionData = await PollutionData.aggregate(pipeline);
    // const pollutionData: any = [];

    console.log(pollutionData.length);
    for (var ind =0; ind< pollutionData.length; ind++){
        console.log(pollutionData[ind]);
        for(var metric=0;metric<pollutionData[ind]["data"].length;metric++){
            if (missingInterval == "yearly"){
                pollutionData[ind]["data"][metric]["dataValCount"]  = pollutionData[ind]["data"][metric]["total"] - pollutionData[ind]["data"][metric]["nullCount"]  
                pollutionData[ind]["data"][metric]["missingValCount"] = 365 - pollutionData[ind]["data"][metric]["total"]  + pollutionData[ind]["data"][metric]["nullCount"]  
            }
            if (missingInterval == "monthly"){
                    pollutionData[ind]["data"][metric]["dataValCount"]  = pollutionData[ind]["data"][metric]["total"] - pollutionData[ind]["data"][metric]["nullCount"]  
                    pollutionData[ind]["data"][metric]["missingValCount"] = 31 - pollutionData[ind]["data"][metric]["total"]  + pollutionData[ind]["data"][metric]["nullCount"]  
            }
            delete pollutionData[ind]["data"][metric].total;
            delete pollutionData[ind]["data"][metric].nullCount;
        }
    }

    res.status(200).send({
      data: pollutionData,
    });
  },
);

export { router as getMissingData };
