import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { json } from 'body-parser';

import { errorHandler } from '@airlifegoa/common';
import { NotFoundError } from '@airlifegoa/common';
import cors from 'cors';
import { createDataSourceRouter } from './pollution/routes/create-data-source';
import { getAllDataSourceRouter } from './pollution/routes/get-all-datasource';
import { editDataSourceRouter } from './pollution/routes/edit-data-source';
import { addDataRouter } from './pollution/routes/add-data';
import { getPollutionDataRouter } from './pollution/routes/get-pollution-data';
import { getNumDataRouter } from './pollution/routes/get-num-data';
import { getDataSourceRouter } from './pollution/routes/get-data-source-api';
import { getPollutionDataDailyRouter } from './pollution/routes/get-pollution-data-daily';
import { getDashboardDataRouter } from './pollution/routes/get-ui-data';
import { getPollutionDataWithFilterRouter } from "./pollution/routes/get-pollution-data-with-filters"
import { getPredictionDataRouter } from './pollution/routes/get-prediction-data';
import { getMissingData } from './pollution/routes/get-missing-data-count';
import { getAllStationDashboardDataRouter } from './pollution/routes/get-all-station-latest-data';
import { getCapitalDataRouter } from './pollution/routes/get-capital-data';
import { getDataSourceMappingRouter } from './pollution/routes/get-all-station-mapping';
import { getTempWindDataRouter } from './pollution/routes/get-temp-wind-data-api';
import { getMetricDataRouter } from './pollution/routes/get-metric-data';

import { currentUserRouter } from './auth/routes/current-user';
import { signupRouter } from './auth/routes/signup';
import { allUsersRouter } from "./auth/routes/all-users";
import { signinRouter } from './auth/routes/signin';
import { signoutRouter } from './auth/routes/signout';
import { verifyEmailRouter } from './auth/routes/verify-email';
import { forgotPasswordRouter } from './auth/routes/forgot-password';
import { resetPasswordRouter } from './auth/routes/reset-password';
import { changeUserRoleRouter } from './auth/routes/change-user-role';
import { inviteForRoleRouter } from './auth/routes/invite-for-role';
import { joinRoleRouter } from './auth/routes/join-role';
import { getUserRouter} from "./auth/routes/get-user";
import { MailChangeUserRoleRouter } from './auth/routes/mail-change-role';

const app = express();

app.use(
  cors({
    // allow any origin
    origin: true,
    credentials: true,
  }),
);


app.use(json());


app.use(
  cookieSession({
    signed: false,
    secure : false,
    httpOnly: true,
  }),
);

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
app.use(getMissingData);
app.use(getAllStationDashboardDataRouter);
app.use(getCapitalDataRouter);
app.use(getTempWindDataRouter);
app.use(getDataSourceMappingRouter);
app.use(getMetricDataRouter);
app.use(allUsersRouter);
app.use(currentUserRouter);
app.use(signupRouter);
app.use(verifyEmailRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(forgotPasswordRouter);
app.use(resetPasswordRouter);
app.use(changeUserRoleRouter);
app.use(inviteForRoleRouter);
app.use(joinRoleRouter);
app.use(getUserRouter);
app.use(MailChangeUserRoleRouter)

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
