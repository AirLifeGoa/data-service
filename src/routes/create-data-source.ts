import express, { Request, Response } from 'express';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import { body } from 'express-validator';
import { DataSource } from '../models/data-source';
import { allowedToCreateDs } from '../middlewares/allowed-to-create-ds';
import { validateDataSource } from '../models/validate-data-source';

const router = express.Router();

// interface DataSourceAttrs {
//   creator : string;
//   name : string;
//   location : {
//     lat : number;
//     lng : number;
//     address : string;
//   }
//   type : "sensor" | "manual";
//   description : string;
//   metrics : string[];
//   expectedFrequencySeconds : number;
//   expectedFrequencyType : "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
// }
router.post(
  '/api/pollution/datasource/create',
  validateDataSource,
  validateRequest,
  currentUser,
  requireAuth,
  allowedToCreateDs,
  async (req: Request, res: Response) => {
    // check if name is already taken in the dataSources collection


    const existingWithName = await DataSource.find({ name: req.body.name });
    if (existingWithName.length > 0) {
      throw new BadRequestError('Name already taken');
    }

    // check if id is already taken in the dataSources collection
    const existingWithId = await DataSource.find({ _id: req.body.id });
    if (existingWithId.length > 0) {
      throw new BadRequestError('Id already taken');
    }


    const dataSource = DataSource.build({
      _id: req.body.id,
      creator: req.currentUser!.id,
      name: req.body.name,
      location: req.body.location,
      type: req.body.type,
      description: req.body.description,
      metrics: req.body.metrics,
      expectedFrequencySeconds: req.body.expectedFrequencySeconds,
      expectedFrequencyType: req.body.expectedFrequencyType,
    });

    await dataSource.save();

    res.status(201).send(dataSource);
  },
);

export { router as createDataSourceRouter };
