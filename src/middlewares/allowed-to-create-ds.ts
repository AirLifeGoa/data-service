const allowedRoles = ["admin", "manager", "dp-manager"];

import { Request, Response, NextFunction } from 'express';
import { AuthorisationError } from '@airlifegoa/common';

// !! To be used once require auth middleware is used
export const allowedToCreateDs = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  if (!req.currentUser?.roles.admin
    &&!req.currentUser?.roles["dp-manager"]
    && !req.currentUser?.roles.manager
  ) {
    throw new AuthorisationError('You do not have permission to create a data source');
  }

  next();
};
