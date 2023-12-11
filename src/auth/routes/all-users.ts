import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthorisationError } from '@airlifegoa/common';
import { User } from '../models/user';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';


const router = express.Router();

router.get('/api/users/all-users',
  async (req: Request, res: Response) => {
   console.log('all-users.ts')
        const userData = await User.find({});
        res.status(200).send(userData);
  });

export { router as allUsersRouter };
