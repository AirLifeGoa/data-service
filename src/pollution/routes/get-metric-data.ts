import express, { Request, Response } from 'express';

import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';
import { PollutionData } from '../models/pollution-data';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get(
  '/api/pollution/metricdata/:dataSourceId',

  async (req: Request, res: Response) => {


    console.log(req.params.dataSourceId, req.query.metric);
    const dataSource = await DataSource.findById(req.params.dataSourceId);

    if (!dataSource) {
        throw new BadRequestError('Data source not found');
      }

    const metric = req.query.metric;
    const metricToQuery = "$data."+metric;

    console.log(metricToQuery);
    const metricData = await PollutionData.aggregate([
        {
          $match: {
            "metadata.dataSourceId": req.params.dataSourceId,
          },
        },
        {
          $group: {
            _id: {
              recordedAt: "$recordedAt",
              sourceId: "$metadata.dataSourceId",
            },
            data: {
              $first: "$$ROOT",
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$data",
          },
        },
        {
          $sort: {
            recordedAt: 1,
          },
        },
        {
          $project: {
            _id: 0,
            recordedAt: 1,
            metric : metricToQuery,
          },
        },
      ]);

    res.status(200).send({
      data: metricData,
    });
  },
);

export { router as getMetricDataRouter };
