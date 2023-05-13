// 0b2bea8a9646afd51c5d34482ef7e086

import express, { Request, Response } from 'express';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';
import {body} from "express-validator";
import {DataSource} from '../models/data-source';

const router = express.Router();


router.get("/api/pollution/temp-wind/:dataSourceId", async (req: Request, res: Response) => {
    // get latitude and longitude for the given data source
    const dataSource = await DataSource.findById(req.params.dataSourceId);
    if (!dataSource) {
        throw new BadRequestError('Data source not found');
    }
    const latitude = dataSource.location.lat
    const longitude = dataSource.location.lng

    // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=0b2bea8a9646afd51c5d34482ef7e086`;
    const response = await fetch(url);
    const data = await response.json();
    const temp = data.main.temp;
    const wind = data.wind.speed;

    res.status(200).send({ temp, wind });

});

export { router as getTempWindDataRouter };
