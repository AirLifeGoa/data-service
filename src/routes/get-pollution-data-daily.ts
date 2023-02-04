import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

// url should contain optional query params pageNumber and pageSize
router.get('/api/pollution/data/daily/:dataSourceId',
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

    // user should be either admin or dp-manager or creator of the data source
    // if not, throw an error

    if (!req.currentUser.roles.admin
      && !req.currentUser.roles['manager']
      && !req.currentUser.roles['data-analyst']
      && !(req.currentUser.id in dataSource.admins)) {
      throw new BadRequestError('You do not have permission to view this data source');
    }

    // get PageNumber and pageSize from query params
    // if not present, set default values
    const pageNumber = req.query.page ? parseInt(req.query.page.toString()) : 1;
    const pageSize = req.query.perPage ? parseInt(req.query.perPage.toString()) : 1000;
    const startDate = req.query.startDate ? new Date(req.query.startDate.toString()) : new Date('2020-01-01');
    const endDate = req.query.endDate ? new Date(req.query.endDate.toString()) : new Date();

    // get pollution data from database
    // filter duplicate data based on timestamp and metadata.sourceId
    // give data from start date to end date
    // use aggregation pipeline

    const pollutionData = await PollutionData.aggregate([
      {
        $match: {
          'metadata.dataSourceId': dataSource.id,
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
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
        $project: {
          __v: 0,
        },
      },
      {
        $facet: {
          data: [
            {
              $skip: (pageNumber - 1) * pageSize,
            },
            {
              $limit: pageSize,
            },
          ],
          total: [
            {
              $count: 'count',
            },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: {
            $arrayElemAt: ['$total.count', 0],
          },
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
  },
);


export { router as getPollutionDataDailyRouter };

