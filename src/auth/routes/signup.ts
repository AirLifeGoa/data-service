import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, BadRequestError } from '@airlifegoa/common';
import { User } from '../models/user';
import { VerificationToken } from '../models/email-verification-token';
import { sendMail } from '../services/mailer';

const router = express.Router();
const appliedRolesOptions = ['admin', 'user', 'manager', 'dp-manager', 'data-analyst'];
router.post('/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('firstName')
      .isLength({
        min: 1,
        max: 20,
      })
      .withMessage('First name must not be empty'),
    body('password')
      .trim()
      .isLength({
        min: 6,
        max: 20,
      })
      .withMessage('Password must be between 6 and 20 characters'),
    body('appliedRole')
      .trim()
      .isIn(appliedRolesOptions)
      .withMessage('appliedRole not valid should be one of: ' + appliedRolesOptions.join(', ')),
  ],
  validateRequest,
  async (req: Request, res: Response) => {

  console.log('In signup route');

    const {
      email,
      password,
      appliedRole,
      firstName,
      lastName,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new BadRequestError('Email in use');
      } else {
        const verificationToken = VerificationToken.build({
          userId: existingUser.id,
          email,
        });
        await verificationToken.save();
        await sendMail(email, firstName, verificationToken.token);
        return res.status(200).send({ message: 'Email sent' });
      }
    }

    const user = User.build({
      email,
      password,
      appliedRole,
      firstName,
      lastName,
    });
    // save user and get the id for the saved user
    await user.save();

    // get the id of the saved user
    const { id } = user;

    // create a new email verification token
    const verificationToken = VerificationToken.build({
      userId: id,
      email,
    });
    // save the token
    await verificationToken.save();
    console.log('Now sending email');
    await sendMail(email, firstName, verificationToken.token);
    res.status(201).send(user);
  },
);

export { router as signupRouter };
