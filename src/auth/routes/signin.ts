import express, { Request, response, Response } from "express";
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@airlifegoa/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import { VerificationToken } from '../models/email-verification-token';
import { sendMail } from '../services/mailer';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must provide a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const {
      email,
      password,
    } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password,
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    if (!existingUser) {
      throw new BadRequestError('User role not set');
    }

    if (!existingUser.emailVerified) {
      // send email verification link
      const verificationToken = VerificationToken.build({
        userId: existingUser.id,
        email,
      });
      await verificationToken.save();
      await sendMail(email, existingUser.firstName, verificationToken.token);
      return res.status(200).send({ message: 'Email sent' });
    }

    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email,
      roles: existingUser.roles,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    }, process.env.JWT_KEY!);

    console.log(userJwt);
    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);

  });

export { router as signinRouter };
