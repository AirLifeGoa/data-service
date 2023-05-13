import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, currentUser, requireAuth, hasRole } from '@airlifegoa/common';
import { User } from '../models/user';
import { roleType } from '../services/role-types';


const router = express.Router();
const appliedRolesOptions = ['admin', 'user', 'manager', 'dp-manager', 'data-analyst'];

router.post('/api/users/change-roles', [
    body('userId')
      .isMongoId()
      .withMessage('userId must be a valid mongo id'),
    body('newRole')
      .trim()
      .isIn(appliedRolesOptions)
      .withMessage('newRole not valid should be one of: ' + appliedRolesOptions.join(', ')),
    body('setTo')
      .isBoolean(),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  hasRole('admin'),
  async (req: Request, res: Response) => {
    const {
      userId,
      newRole,
      setTo,
    }: { userId: string, newRole: roleType, setTo: boolean } = req.body;

    const user = await User.findOneAndUpdate({ _id: userId }, {
        emailVerified: true,
        ['roles.' + newRole]: setTo,
      },
      { new: true },
    );
    res.status(200).send(user);
  },
);

export { router as changeUserRoleRouter };



