import express, { Request, Response } from 'express';

import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.post(
  '/api/pollution/prediction/:dataSourceId',
  [body('modelName').isIn(['lstm', 'prophet', 'arima', 'hybrid-lstm']).withMessage('Specified Model is not available')],
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    if (!req.currentUser) {
      throw new BadRequestError('User not found');
    }

    console.log(req.params.dataSourceId);
    const dataSource = await DataSource.findById(req.params.dataSourceId);
    const num_days_back = 50;
    // change it to days after the meeting

    var startDate, endDate;
    if (req.body.startDate !== undefined && req.body.startDate !== null) {
      startDate = new Date(req.body.startDate);
    } else {
      startDate = new Date(new Date().setHours(0, 0, 0, 0));
      console.log(startDate);
      startDate = new Date(startDate.getTime() + 1000 * 60 * 30 * 11);
      startDate.setDate(startDate.getDate() - num_days_back);
      console.log(startDate);
    }
    if (req.body.startDate !== undefined && req.body.startDate !== null) {
      endDate = new Date(req.body.endDate);
    } else {
      endDate = new Date(new Date().setHours(0, 0, 0, 0));
      endDate = new Date(endDate.getTime() + 1000 * 60 * 30 * 11);
      endDate.setDate(endDate.getDate() + 7);
    }

    if (!dataSource) {
      throw new BadRequestError('Data source not found');
    }

    //   var todaysdate = new Date(new Date().setHours(0, 0, 0, 0));
    //   todaysdate = new Date(todaysdate.getTime() + 1000 * 60 * 30 * 11);
    //   var tomorrow = new Date(todaysdate.getTime() + 1000 * 60 * 60 * 24);

    console.log(startDate, endDate, req.body);

    const predictionData = await PredictionData.aggregate([
      {
        $match: {
          'metadata.dataSourceId': req.params.dataSourceId,
          'metadata.modelName': req.body.modelName,
          recordedAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ]);

    res.status(200).send({
      data: predictionData,
    });
  },
);

export { router as getPredictionDataRouter };
