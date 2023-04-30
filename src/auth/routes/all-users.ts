import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthorisationError } from '@airlifegoa/common';
import { User } from '../models/user';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';


const router = express.Router();

router.get('/api/users/all-users',
validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
   console.log('all-users.ts', req.currentUser)
        if (req.currentUser == undefined) {
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

export { router as allUsersRouter };
