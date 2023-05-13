import express, { Request, Response } from 'express';
import { VerificationToken } from '../models/email-verification-token';
import { User } from '../models/user';
import { BadRequestError } from '@airlifegoa/common';

const router = express.Router();

router.post('/api/users/verify-email/:token',
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new BadRequestError('Invalid Expired token');
    }
    const { userId } = verificationToken;

    // find user by ID and update emailVerified to true and roles.user to true
    const user = await User.findOneAndUpdate({ _id: userId }, {
        emailVerified: true,
        'roles.user': true,
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError('User not found');
    }

    await VerificationToken.findByIdAndDelete(verificationToken.id);

    res.status(200).send(user);
  },
);

export { router as verifyEmailRouter };
