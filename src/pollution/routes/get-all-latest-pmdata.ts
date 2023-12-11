import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';

const router = express.Router();

router.get(
  '/api/pollution/dashboard/latestData',
  async (req: Request, res: Response) => {
    console.log('Request for latest data');
    const pipeline: any[] = [
        {
            $sort: { 'metadata.dataSourceId': 1, recordedAt: -1 } as any, // Casting to any
        },
        {
            $group: {
                _id: '$metadata.dataSourceId',
                latestData: {
                    $first: {
                        recordedAt: '$recordedAt',
                        data: '$data',
                        uploadedBy: '$uploadedBy',
                        metadata: '$metadata',
                    },
                },
            },
        },
        {
            $replaceRoot: { newRoot: '$latestData' },
        },
        {
            $project: {
              recordedAt: 1,
              dataSourceId: '$metadata.dataSourceId',
              data: 1,
              _id: 0, // Explicitly include _id to avoid the error
            },
          },

    ];
      
    const latestDataForSources = await PollutionData.aggregate(pipeline);
      


    res.status(200).send(latestDataForSources);
  },
);

export { router as getAllStationPMRouter };
