import { Request, Response, NextFunction } from 'express';


interface IQueryParams {
  key: string;
  value: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      queryParams?: any;
    }
  }
}
export const getQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // get the query params from the request
  const queryParams = Object.keys(req.query).map((key) => {
    return { key, value: req.query[key] };
  });
  
  req.queryParams = queryParams;

  next();

};
