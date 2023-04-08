import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthorisationError } from '@airlifegoa/common';
import { User } from '../models/user';
import { currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

router.get('/api/users/all-users',
  // currentUser,
  // requireAuth,
  async (req: Request, res: Response) => {
  console.log('all-users.ts')
    const users = await User.find({});
    res.status(200).send(users);
  });

export { router as allUsersRouter };
