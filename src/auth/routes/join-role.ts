import express, { Request, Response } from 'express';
import { RoleToken } from '../models/role-token';
import { User } from '../models/user';
import { BadRequestError } from '@airlifegoa/common';

const router = express.Router();

router.post('/api/users/join-role/:token',
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const roleToken = await RoleToken.findOne({ token });
    if (!roleToken || roleToken.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or Expired token');
    }
    const {
      userId,
      forRole,
    } = roleToken;

    // find user by ID and update emailVerified to true and roles.user to true
    const user = await User.findOneAndUpdate({ _id: userId }, {
        ['roles.' + forRole]: true,
      },
      { new: true },
    );

    if (!user) {
      throw new BadRequestError('User not found');
    }

    await RoleToken.findByIdAndDelete(roleToken.id);

    res.status(200).send(user);
  },
);

export { router as joinRoleRouter };
