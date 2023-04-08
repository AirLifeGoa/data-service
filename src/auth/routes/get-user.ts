import express, { Request, response, Response } from "express";
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@airlifegoa/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import { VerificationToken } from '../models/email-verification-token';
import { sendMail } from '../services/mailer';

const router = express.Router();

router.get('/api/users/get-user/:id',
  async (req: Request, res: Response) => {
   const id = req.params.id;

    const existingUser = await User.findOne({
      _id: id,
    });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    res.status(200).send(existingUser);

  });

export { router as getUserRouter };
