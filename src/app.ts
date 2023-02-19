import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { json } from 'body-parser';

import { errorHandler } from '@airlifegoa/common';
import { NotFoundError } from '@airlifegoa/common';
import cors from 'cors';
import { createDataSourceRouter } from './routes/create-data-source';
import { getAllDataSourceRouter } from './routes/get-all-datasource';
import { editDataSourceRouter } from './routes/edit-data-source';
import { addDataRouter } from './routes/add-data';
import { getPollutionDataRouter } from './routes/get-pollution-data';
import { getNumDataRouter } from './routes/get-num-data';
import { getDataSourceRouter } from './routes/get-data-source-api';
import { getPollutionDataDailyRouter } from './routes/get-pollution-data-daily';
import { getDashboardDataRouter } from './routes/get-ui-data';
import { getPollutionDataWithFilterRouter } from "./routes/get-pollution-data-with-filters"
import { getPredictionDataRouter } from './routes/get-prediction-data';

const app = express();

app.set('trust proxy', true);

app.use(json());
app.use(cors({
    credentials: true,
}));

app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
}));


// app.use(cookieSession({
//     signed: false,
//     // secure: process.env.NODE_ENV !== 'test',
//     secure: false,
//     httpOnly: false,
// }));

// handle cors errors

app.use(createDataSourceRouter);
app.use(getDataSourceRouter);
app.use(getAllDataSourceRouter);
app.use(editDataSourceRouter);
app.use(addDataRouter);
app.use(getPollutionDataRouter);
app.use(getNumDataRouter);
app.use(getPollutionDataDailyRouter);
app.use(getPollutionDataWithFilterRouter);
app.use(getDashboardDataRouter);
app.use(getPredictionDataRouter);


app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
