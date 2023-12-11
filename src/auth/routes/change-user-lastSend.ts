import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/change-lastSend', [
    body('userId')
      .isMongoId()
      .withMessage('userId must be a valid mongo id'),
    body('newLastSend')
      .isDate()
      .withMessage('newLastSend must be valid'),
  ],
  async (req: Request, res: Response) => {
    const {
      userId,
      newLastSend
    }: { userId: string, newLastSend: Date } = req.body;
    
    const user = await User.findOneAndUpdate({ _id: userId }, {
        lastSend: newLastSend,
    },
    );
    res.status(200).send(user);
  },
);

export { router as changeLastSendRouter };



