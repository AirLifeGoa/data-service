import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@airlifegoa/common';
import { PasswordToken } from '../models/password-reset-token';
import { sendMail } from '../services/mailer';

const router = express.Router();

router.post('/api/users/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      email,
    } = req.body;
    const existingUser = await User.findOne({
      email,
    });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordToken = PasswordToken.build({
      userId: existingUser.id,
      email: existingUser.email,
    });
    await passwordToken.save();
    const { token } = passwordToken;

    // send email with token
    await sendMail(email, existingUser.firstName, token);

    res.status(200).send({ message: 'Email sent' });
  });

export { router as forgotPasswordRouter };
