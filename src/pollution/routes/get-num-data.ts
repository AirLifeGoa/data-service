import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();


// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/data/num-rows/:dataSourceId',
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
    if (!req.currentUser.roles.admin
      && !req.currentUser.roles['manager']
      && !req.currentUser.roles['data-analyst']
      && !(req.currentUser.id in dataSource.admins)) {
      throw new BadRequestError('You do not have permission to view this data source');
    }


    // count the number of unique data for the given data source

    const numRows = await PollutionData.aggregate([
      {
        $match: {
          'metadata.dataSourceId': dataSource.id,
        },
      },
      {
        $group: {
          _id: {
            recordedAt: '$recordedAt',
          },
        },
      },
      {
        $count: 'numRows',
      },
    ]);

    res.status(200).send({ numRows: numRows[0].numRows });
  });


export { router as getNumDataRouter };
