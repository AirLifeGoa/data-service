import express, { Request, Response } from 'express';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import {body} from "express-validator";
import {DataSource} from '../models/data-source';
import { User } from '../../auth/models/user';

const router = express.Router();


router.get("/api/pollution/datasource",  validateRequest, currentUser, requireAuth, 
async (req: Request, res: Response) => {
    
    if (!req.currentUser) {
        throw new BadRequestError('User not found');
    }

    const userId = req.currentUser.id;
    if (!req.currentUser.roles.admin ) 
    {
        const userData = await User.find({"_id": userId});
        res.status(200).send(userData);
    }
    const userData = await User.find({});
    res.status(200).send(userData);
});

export { router as getAllUserDataRouter };
