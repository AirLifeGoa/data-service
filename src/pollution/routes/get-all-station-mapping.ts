import express, { Request, Response } from 'express';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import {body} from "express-validator";
import {DataSource} from '../models/data-source';

const router = express.Router();


router.get("/api/pollution/datasourcemapping", async (req: Request, res: Response) => {
  const dataSources = await DataSource.find({}).sort({ _id: 1 });
  const mapping: any = {};
  for (let i=0;i<dataSources.length;i++){
    mapping[dataSources[i]._id]= dataSources[i].name
  }
  console.log(mapping);
  res.status(200).send(mapping);
});

export { router as getDataSourceMappingRouter };
