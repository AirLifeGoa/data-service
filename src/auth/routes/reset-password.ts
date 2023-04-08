import express, { Request, Response } from 'express';
import { PasswordToken } from '../models/password-reset-token';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@airlifegoa/common';
import { body } from 'express-validator';

const router = express.Router();

router.post('/api/users/reset-password/:token',
  [
    body('newPassword')
      .trim()
      .isLength({
        min: 6,
        max: 20,
      })
      .withMessage('Password must be between 6 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // see if the token is valid and user exists
    const passwordToken = await PasswordToken.findOne({
      token,
    });

    if (!passwordToken || passwordToken.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired token');
    }

    const user = await User.findOne({
      email: passwordToken.email,
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // update the password
    user.password = newPassword;
    await user.save();

    // delete the token
    await PasswordToken.deleteOne({
        token,
      },
    );

    res.status(204).send({ message: 'Password updated' });
  });

export { router as resetPasswordRouter };
