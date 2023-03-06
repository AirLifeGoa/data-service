import express, { Request, Response } from 'express';

import { PredictionData } from '../models/prediction-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/prediction/:dataSourceId', currentUser, requireAuth, async (req: Request, res: Response) => {
  if (!req.currentUser) {
    throw new BadRequestError('User not found');
  }

  console.log(req.params.dataSourceId);
  const dataSource = await DataSource.findById(req.params.dataSourceId);

  // change it to days after the meeting
  const startDate = new Date();
  const endDate = new Date(req.body.endDate);

  if (!dataSource) {
    throw new BadRequestError('Data source not found');
  }

  var todaysdate = new Date(new Date().setHours(0, 0, 0, 0));
  todaysdate = new Date(todaysdate.getTime() + 1000 * 60 * 30 * 11);
  var tomorrow = new Date(todaysdate.getTime() + 1000 * 60 * 60 * 24);

  console.log(todaysdate, tomorrow);

  const predictionData = await PredictionData.aggregate([
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

  res.status(200).send({
    data: predictionData,
  });
});

export { router as getPredictionDataRouter };
