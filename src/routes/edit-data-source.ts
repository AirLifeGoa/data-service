import express, {Request, Response, NextFunction} from 'express';
import { currentUser } from '@airlifegoa/common';
import { body } from 'express-validator';
import { validateRequest } from '@airlifegoa/common';
import { DataSource } from '../models/data-source';
import { BadRequestError } from '@airlifegoa/common';
import { validateDataSource } from '../models/validate-data-source';
import { allowedToCreateDs } from '../middlewares/allowed-to-create-ds';

const router = express.Router();

router.patch('/api/pollution/datasource/:id',
  validateDataSource,
  validateRequest,
  currentUser,
  allowedToCreateDs,
  async (req: Request, res: Response) => {
      // see if either currentUser is a manager or admin or dp-manager of the data source
      // if not, throw an error
      const dataSource = await DataSource.findById(req.params.id);
      if(!dataSource){
        throw new BadRequestError("Data source not found");
      }
      if(dataSource.creator !== req.currentUser!.id
        && !req.currentUser!.roles.admin
        && !req.currentUser!.roles["dp-manager"]){
        throw new BadRequestError("You do not have permission to edit this data source");
      }

      dataSource.set({
        name: req.body.name,
        location: req.body.location,
        type: req.body.type,
        description: req.body.description,
        metrics: req.body.metrics,
        expectedFrequencySeconds: req.body.expectedFrequencySeconds,
        expectedFrequencyType: req.body.expectedFrequencyType,
      });

      await dataSource.save();
      res.status(200).send(dataSource);
  }
);
export { router as editDataSourceRouter };


