import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/data/:dataSourceId', currentUser, requireAuth, async (req: Request, res: Response) => {
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

  // get PageNumber and pageSize from query params
  // if not present, set default values
  const pageNumber = req.query.page ? parseInt(req.query.page.toString()) : 1;
  const pageSize = req.query.perPage ? parseInt(req.query.perPage.toString()) : 100;

  // get pollution data from database
  // filter duplicate data based on meta.addedAt and select one which is latest
  // use aggregation pipeline
  // sort in descending order of timestamp which is recordedAt field
  // skip and limit based on page number and page size
  // add id field which is _id field

  const pollutionData = await PollutionData.aggregate([
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
      $skip: (pageNumber - 1) * pageSize,
    },
    {
      $limit: pageSize,
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
    },
  ]);

  // send data as well as next page number and page size
  // if no more data, send null for next page number and page size

  const nextPageNumber = pollutionData.length === pageSize ? pageNumber + 1 : null;
  const nextPagePageSize = pollutionData.length === pageSize ? pageSize : null;

  res.status(200).send({
    data: pollutionData,
  });
});

export { router as getPollutionDataRouter };
