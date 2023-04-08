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

  // // if query don't have duration then add it
  // if (!queryParams.find((param) => param.key === 'duration')) {
  //   queryParams.push({ key: 'duration', value: 'day' });
  // }
  //
  // // if query don't have end date then add current date
  // if (!queryParams.find((param) => param.key === 'endDate')) {
  //   queryParams.push({ key: 'endDate', value: new Date().toISOString() });
  // }
  //
  // //
  // // if query don't have start date then add start date based on end date and duration
  // if (!queryParams.find((param) => param.key === 'startDate')) {
  //   queryParams.push({ key: 'startDate', value: new Date().toISOString() });
  // }
  
  req.queryParams = queryParams;

  next();

};
