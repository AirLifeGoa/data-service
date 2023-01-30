import express, { Request, Response } from 'express';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import {body} from "express-validator";
import {DataSource} from '../models/data-source';

const router = express.Router();


router.get("/api/pollution/datasource", async (req: Request, res: Response) => {
  const dataSources = await DataSource.find({});
  res.status(200).send(dataSources);
});

export { router as getAllDataSourceRouter };
