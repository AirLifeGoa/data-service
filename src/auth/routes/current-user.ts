import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthorisationError } from '@airlifegoa/common';
import { User } from '../models/user';
import { currentUser, requireAuth } from '@airlifegoa/common';

const router = express.Router();

router.get('/api/users/currentuser',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    const payload = req.currentUser;

    // recreate a new token
    // useful when some data in the token has changed
    const { id } = payload as { id: string };
    const userFromDb = await User.findById(id);
    if (!userFromDb) {
      throw new AuthorisationError('Authorisation failed, user not found');
    }

    const userJwt = jwt.sign({
        id: userFromDb.id,
        email: userFromDb.email,
        roles: userFromDb.roles,
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      , process.env.JWT_KEY!);

    // set the new token in the session
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(userFromDb);
  });

export { router as currentUserRouter };
