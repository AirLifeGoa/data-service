import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, BadRequestError, currentUser, isAdmin, requireAuth } from '@airlifegoa/common';
import { User } from '../models/user';
import { roleType } from '../services/role-types';

import { RoleToken } from '../models/role-token';
import { sendMail } from '../services/mailer';

const router = express.Router();
const appliedRolesOptions = ['admin', 'user', 'manager', 'dp-manager', 'data-analyst'];

router.post('/api/users/invite-for-role', [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('role')
      .trim()
      .isIn(appliedRolesOptions)
      .withMessage('role not valid should be one of: ' + appliedRolesOptions.join(', ')),
  ],
  validateRequest,
  // currentUser,
  // requireAuth,
  // isAdmin,
  async (req: Request, res: Response) => {
    const {
      email,
      role,

    }: { email: string, role: roleType } = req.body;

    const existing = await User.findOne({ email });

    if (!existing) {
      throw new BadRequestError('Email not registered');
    }
    // create a role-token
    const roleToken = RoleToken.build({
      userId: existing.id,
      email,
      forRole: role,
    });
    await roleToken.save();
    await sendMail(email, existing.firstName, roleToken.token);
    res.status(200).send({ message: 'Email sent' });
  },
);

export { router as inviteForRoleRouter };

