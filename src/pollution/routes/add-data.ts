import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import {DataLogs} from "../models/data-log"
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import { DataSource } from '../models/data-source';

const router = express.Router();

router.post(
  '/api/pollution/data',
  [
    body().isArray(),
    // body('*.recordedAt')
    //   .isISO8601()
    //   .withMessage('RecordedAt must be a valid date'),
    body('*.data')
      .isObject()
      .withMessage('Data must be a valid object'),
    body('*.metadata')
      .isObject()
      .withMessage('metadata must be a valid object'),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    console.log("hi");
    if (!req.currentUser) {
      throw new BadRequestError('User not found');
    }

    const userId = req.currentUser.id;

    const dataStore: any = [];
    const dataLogs: any = {};

    // create a map of searched dataSource info so that we don't have to search for it again and again
    const allowedDataSources = new Map();
    const notAllowedDataSources = new Map();
    
    for (let i = 0; i < req.body.length; i++) {

      // get the dataSource id
      const dataSourceId = req.body[i].metadata.dataSourceId;

      // check if the dataSourceId is in the disallowedDataSources map
      if (notAllowedDataSources.has(dataSourceId)) {
        console.log('not allowed');
        continue;
      }

      // check if not in the allowedDataSources map
      if (!allowedDataSources.has(dataSourceId)) {
        
        const dataSource = await DataSource.findById(dataSourceId);

        if (!dataSource) {
          console.log('not found');
          throw new BadRequestError('Data source not found');
        }

        // check if the user is allowed to add data to this data source
        // for that user has to be one of the following:
        // 1. An admin
        // 2. A manager
        // 3. A dp-manager and one of admins of the data source

        if (!(userId in dataSource.admins)
          && !req.currentUser.roles.admin
          && !req.currentUser.roles['manager']) {
          notAllowedDataSources.set(dataSourceId, true);
          continue;
        }

      }

      const modifiedData = {
        recordedAt: req.body[i].recordedAt,
        data: req.body[i].data,
        uploadedBy: {
          id: userId,
          type: 'manual',
        },
        metadata: req.body[i].metadata,
      };
      
      dataStore.push(modifiedData);
      allowedDataSources.set(dataSourceId, true);

      if (!dataLogs[dataSourceId]){
            dataLogs[dataSourceId] = 1;
        }
        else{
            dataLogs[dataSourceId] += 1;
        }
    }

    // print modified data as json
    // console.log(JSON.stringify(dataStore));
    
    // create an array of pollution data
    const pollutionData = dataStore.map((data: any) => {
        return PollutionData.build(data);
      },
    );

    // console.log(pollutionData[0], pollutionData[1]);

    // console.log(pollutionData[1].recordedAt- pollutionData[0].recordedAt)
    // save the pollution data
    const result = await PollutionData.insertMany(pollutionData);
    
    for (var dataSourceId in dataLogs){
        const datalog = await DataLogs.findById(dataSourceId);
        console.log(datalog);
        if(datalog == null){
            
            await DataLogs.insertMany([{
                    _id : dataSourceId,
                    lastUpdated: new Date(),
                    newDataPoints: dataLogs[dataSourceId],
                    previousTrainedTime: new Date()

            }]);
        }else{
            await DataLogs.updateOne({_id: dataSourceId}, {
                $set: {
                    newDataPoints: datalog.newDataPoints + dataLogs[dataSourceId],
                    lastUpdated: Date.now(),
                }
            });
        }
    }
    
    res.status(201).send(pollutionData);
  },
);

export { router as addDataRouter };
