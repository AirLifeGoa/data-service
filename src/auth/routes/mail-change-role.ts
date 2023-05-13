import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, currentUser, requireAuth, hasRole } from '@airlifegoa/common';
import { User } from '../models/user';
import { roleType } from '../services/role-types';
import { sendMail } from '../services/changeRoleMail';



const router = express.Router();
const appliedRolesOptions = ['admin', 'user', 'manager', 'dp-manager', 'data-analyst'];


router.post('/api/users/mail-change-roles', [
    body('userId')
      .isMongoId()
      .withMessage('userId must be a valid mongo id'),
    body('newRole')
      .trim()
      .isIn(appliedRolesOptions)
      .withMessage('newRole not valid should be one of: ' + appliedRolesOptions.join(', ')),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  hasRole('admin'),
  async (req: Request, res: Response) => {
    const {
      userId,
      newRole,
    }: { userId: string, newRole: roleType } = req.body;

    console.log(userId);

    const existingUser = await User.findOne({ "_id":userId });
    
    if (existingUser==null){
        res.status(200).send("User not found");
    }
    else {
        await sendMail(existingUser.email, existingUser.firstName, newRole);
    }
    res.status(200).send(existingUser);
    
  },
);

export { router as MailChangeUserRoleRouter };
