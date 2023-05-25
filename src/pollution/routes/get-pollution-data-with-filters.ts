import express, { Request, Response } from 'express';

import { PollutionData } from '../models/pollution-data';
import { DataSource } from '../models/data-source';
import { body } from 'express-validator';
import { BadRequestError, currentUser, requireAuth, validateRequest } from '@airlifegoa/common';

const router = express.Router();

const QueryList = {
  avg_monthly_pipeline:[
    {
        $group: {
        _id: {
            year: {
            $year: "$recordedAt",
            },
            month: {
            $month: "$recordedAt",
            },
        },
        SO2: {
            $avg: "$data.SO2",
        },
        PM10: {
            $avg: "$data.PM10",
        },
        O3: {
            $avg: "$data.O3",
        },
        CO: {
            $avg: "$data.CO",
        },
        NO2: {
            $avg: "$data.NO2",
        },
        PM25: {
            $avg: "$data.PM25",
        },
        Pb: {
            $avg: "$data.Pb",
        },
        AQI: {
            $avg: "$data.AQI",
        },
        recordedAt: {
            $first: {
            $dateFromParts: {
                year: {
                $year: "$recordedAt",
                },
                month: {
                $month: "$recordedAt",
                },
                day: 1,
            },
            },
        },
        data: {
            $first: "$$ROOT",
        },
        },
    },
    {
        $project: {
        _id: "$_id",
        recordedAt: "$data.recordedAt",
        metadata: "$data.metadata",
        uploadedBy: "$data.uploadedBy",
        "data.PM10": "$PM10",
        "data.PM25": "$PM25",
        "data.SO2": "$SO2",
        "data.NO2": "$NO2",
        "data.Pb": "$Pb",
        "data.O3": "$O3",
        "data.CO": "$CO",
        "data.AQI": "$AQI",
        },
    },
    {
        $sort:
        {
            recordedAt: 1,
        },
    },
  ],
  avg_week_pipeline:[
    {
        $addFields: {
          weekStart: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $subtract: [
                  "$recordedAt",
                  {
                    $multiply: [
                      {
                        $subtract: [
                          {
                            $dayOfWeek: "$recordedAt",
                          },
                          2,
                        ],
                      },
                      24 * 60 * 60 * 1000,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$weekStart",
          SO2: {
            $avg: "$data.SO2",
          },
          PM10: {
            $avg: "$data.PM10",
          },
          O3: {
            $avg: "$data.O3",
          },
          CO: {
            $avg: "$data.CO",
          },
          NO2: {
            $avg: "$data.NO2",
          },
          PM25: {
            $avg: "$data.PM25",
          },
          Pb: {
            $avg: "$data.Pb",
          },
          AQI: {
            $avg: "$data.AQI",
          },
          data: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $project: {
          _id: "$data._id",
          recordedAt: "$data.recordedAt",
          "data.PM10": "$PM10",
          "data.PM25": "$PM25",
          "data.SO2": "$SO2",
          "data.NO2": "$NO2",
          "data.Pb": "$Pb",
          "data.AQI": "$AQI",
          "data.CO": "$CO",
          "data.O3": "$O3",
          metadta: "$data.metadata",
          uploadedBy: "$data.uploadedBy",
        },
      },
      {
        $sort:
          {
            recordedAt: 1,
          },
      },
  ],
  avg_pipeline: [
    {
      $unwind: '$data',
    },
    {
      $project: {
        'data.data.PM10': {
          $ifNull: ['$data.data.PM10', 0],
        },
        'data.data.SO2': {
          $ifNull: ['$data.data.SO2', 0],
        },
        'data.data.NO2': {
          $ifNull: ['$data.data.NO2', 0],
        },
        'data.data.Pb': {
          $ifNull: ['$data.data.Pb', 0],
        },
        'data.data.O3': {
          $ifNull: ['$data.data.O3', 0],
        },
        'data.data.PM25': {
          $ifNull: ['$data.data.PM25', 0],
        },
        'data.data.AQI': {
          $ifNull: ['$data.data.AQI', 0],
        },
        'data.data.CO': {
            $ifNull: ['$data.data.CO', 0],
        },
        _id: 1,
        'data.recordedAt': '$data.recordedAt',
        'data.metadata': '$data.metadata',
        'data.uploadedBy': '$data.uploadedBy',
        'data._id': '$data._id',
      },
    },
    {
      $sort: {
        'data.recordedAt': 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        avgPM10: {
          $avg: '$data.data.PM10',
        },
        avgSO2: {
          $avg: '$data.data.SO2',
        },
        avgNO2: {
          $avg: '$data.data.NO2',
        },
        avgO3: {
          $avg: '$data.data.O3',
        },
        avgPM25: {
          $avg: '$data.data.PM25',
        },
        avgPb: {
          $avg: '$data.data.Pb',
        },
        avgAQI: {
            $avg: '$data.data.AQI',
        },
        avgCO: {
            $avg: '$data.data.CO',
        },
        data: {
          $first: '$$ROOT',
        },
      },
    },
    {
      $sort: {
        'data.data.recordedAt': 1,
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 1,
        'data.recordedAt': '$data.data.recordedAt',
        'data.metadata': '$data.data.metadata',
        'data.data': '$data.data.data',
        'data.uploadedBy': '$data.data.uploadedBy',
        'data._id': '$data.data._id',
        avgPM10: 1,
        avgSO2: 1,
        avgNO2: 1,
        avgO3: 1,
        avgPM25: 1,
        avgPb: 1,
        avgAQI: 1,
        avgCO: 1,
      },
    },
    {
      $sort: {
        'data.recordedAt': 1,
      },
    },
    {
      $set: {
        'data.data.PM10': '$avgPM10',
        'data.data.SO2': '$avgSO2',
        'data.data.Pb': '$avgPb',
        'data.data.PM25': '$avgPM25',
        'data.data.O3': '$avgO3',
        'data.data.NO2': '$avgNO2',
        'data.data.AQI': '$avgAQI',
        'data.data.CO': '$avgCO',
      },
    },
    {
      $project: {
        avgPM10: 0,
        avgPM25: 0,
        avgNO2: 0,
        avgSO2: 0,
        avgO3: 0,
        avgPb: 0,
        avgAQI: 0,
        avgCO: 0
      },
    },
    {
      $replaceRoot: {
        newRoot: '$data',
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        timestamp: 1,
        data: 1,
        metadata: 1,
        recordedAt: 1,
        uploadedBy: 1,
      },
    },
    {
      $sort: {
        recordedAt: 1,
      },
    },
  ],
  min_pipeline: [
    {
      $project: {
        'data.data.PM10': { $ifNull: ['$data.data.PM10', 'null'] },
        'data.data.SO2': { $ifNull: ['$data.data.SO2', 'null'] },
        'data.data.NO2': { $ifNull: ['$data.data.NO2', 'null'] },
        'data.data.Pb': { $ifNull: ['$data.data.Pb', 'null'] },
        'data.data.O3': { $ifNull: ['$data.data.O3', 'null'] },
        'data.data.PM25': { $ifNull: ['$data.data.PM25', 'null'] },
        _id: 1,
        'data.recordedAt': '$data.recordedAt',
        'data.metadata': '$data.metadata',
        'data.uploadedBy': '$data.uploadedBy',
        'data._id': '$data._id',
      },
    },
    {
      $project: {
        data: {
          $arrayElemAt: ['$data', 0],
        },
      },
    },
    {
      $set: {
        'data.recordedAt': {
          $arrayElemAt: ['$data.recordedAt', 0],
        },
        'data.metadata': {
          $arrayElemAt: ['$data.metadata', 0],
        },
        'data.uploadedBy': {
          $arrayElemAt: ['$data.uploadedBy', 0],
        },
        'data._id': {
          $arrayElemAt: ['$data._id', 0],
        },
      },
    },
    {
      $set: {
        minPM10: {
          $min: '$data.data.PM10',
        },
        minSO2: {
          $min: '$data.data.SO2',
        },
        minNO2: {
          $min: '$data.data.NO2',
        },
        minO3: {
          $min: '$data.data.O3',
        },
        minPb: {
          $min: '$data.data.Pb',
        },
        minPM25: {
          $min: '$data.data.PM25',
        },
      },
    },
    {
      $set: {
        'data.data.PM10': '$minPM10',
        'data.data.SO2': '$minSO2',
        'data.data.Pb': '$minPb',
        'data.data.PM25': '$minPM25',
        'data.data.O3': '$minO3',
        'data.data.NO2': '$minNO2',
      },
    },
    {
      $project: {
        minPM10: 0,
        minSO2: 0,
        minPb: 0,
        minPM25: 0,
        minO3: 0,
        minNO2: 0,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$data',
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        timestamp: 1,
        data: 1,
        metadata: 1,
        recordedAt: 1,
        uploadedBy: 1,
      },
    },
    {
      $sort: {
        recordedAt: 1,
      },
    },
  ],
  max_pipeline: [
    {
      $project: {
        'data.data.PM10': { $ifNull: ['$data.data.PM10', 'null'] },
        'data.data.SO2': { $ifNull: ['$data.data.SO2', 'null'] },
        'data.data.NO2': { $ifNull: ['$data.data.NO2', 'null'] },
        'data.data.Pb': { $ifNull: ['$data.data.Pb', 'null'] },
        'data.data.O3': { $ifNull: ['$data.data.O3', 'null'] },
        'data.data.PM25': { $ifNull: ['$data.data.PM25', 'null'] },
        _id: 1,
        'data.recordedAt': '$data.recordedAt',
        'data.metadata': '$data.metadata',
        'data.uploadedBy': '$data.uploadedBy',
        'data._id': '$data._id',
      },
    },
    {
      $project: {
        data: {
          $arrayElemAt: ['$data', 0],
        },
      },
    },
    {
      $set: {
        'data.recordedAt': {
          $arrayElemAt: ['$data.recordedAt', 0],
        },
        'data.metadata': {
          $arrayElemAt: ['$data.metadata', 0],
        },
        'data.uploadedBy': {
          $arrayElemAt: ['$data.uploadedBy', 0],
        },
        'data._id': {
          $arrayElemAt: ['$data._id', 0],
        },
      },
    },
    {
      $set: {
        maxPM10: {
          $max: '$data.data.PM10',
        },
        maxSO2: {
          $max: '$data.data.SO2',
        },
        maxNO2: {
          $max: '$data.data.NO2',
        },
        maxO3: {
          $max: '$data.data.O3',
        },
        maxPb: {
          $max: '$data.data.Pb',
        },
        maxPM25: {
          $max: '$data.data.PM25',
        },
      },
    },
    {
      $set: {
        'data.data.PM10': '$maxPM10',
        'data.data.SO2': '$maxSO2',
        'data.data.Pb': '$maxPb',
        'data.data.PM25': '$maxPM25',
        'data.data.O3': '$maxO3',
        'data.data.NO2': '$maxNO2',
      },
    },
    {
      $project: {
        maxPM10: 0,
        maxSO2: 0,
        maxPb: 0,
        maxPM25: 0,
        maxO3: 0,
        maxNO2: 0,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$data',
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        timestamp: 1,
        data: 1,
        metadata: 1,
        recordedAt: 1,
        uploadedBy: 1,
      },
    },
    {
      $sort: {
        recordedAt: 1,
      },
    },
  ],
};

// url should contain optional query params pageNumber and pageSize
router.post(
  '/api/pollution/data/filter/:dataSourceId',
  [
    body('startDate').isDate().withMessage('start date should be in date format'),
    body('endDate').isDate().withMessage('end date should be in date format'),
    body('filter').isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('stats').isIn(['min', 'max', 'avg']),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    console.log(req.params.dataSourceId);
    const dataSource = await DataSource.findById(req.params.dataSourceId);

    if (!dataSource) {
      throw new BadRequestError('Data source not found');
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    var filterValue = req.body.filter;
    const query = req.body.stats;

    if (filterValue == 'weekly') {
      filterValue = { $week: '$recordedAt' };
    } else if (filterValue == 'monthly') {
      filterValue = { $month: '$recordedAt' };
    } else if (filterValue == 'yearly') {
      filterValue = { $year: '$recordedAt' };
    } else if (filterValue == 'daily') {
      filterValue = { timestamp: '$recordedAt' };
    }

    var pipeline: any[] = [
      {
        $match: {
          'metadata.dataSourceId': req.params.dataSourceId,
          recordedAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $sort: {
          'metadata.addedAt': -1,
        },
      },
      {
        $group: {
          _id: {
            recordedAt: '$recordedAt',
            sourceId: '$metadata.sourceId',
          },
          data: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
      {
        $sort: {
          recordedAt: -1,
        },
      },
      {
        $group: {
          _id: filterValue,
          data: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    if (query === 'min') {
      pipeline = pipeline.concat(QueryList['min_pipeline']);
    } else if (query === 'max') {
      pipeline = pipeline.concat(QueryList['max_pipeline']);
    }else if (query === 'avg'  && req.body.filter == "weekly"){
        pipeline = pipeline.slice(0, pipeline.length -2);
        pipeline = pipeline.concat(QueryList['avg_week_pipeline']);
    } 
    else if (query === 'avg'  && req.body.filter == "monthly"){
        pipeline = pipeline.slice(0, pipeline.length -2);
        pipeline = pipeline.concat(QueryList['avg_monthly_pipeline']);
    } 
    else if (query === 'avg' ) {
      console.log('inside avg');
      pipeline = pipeline.concat(QueryList['avg_pipeline']);
    }

    const pollutionData = await PollutionData.aggregate(pipeline);

    console.log(pollutionData.length);

    res.status(200).send({
      data: pollutionData,
    });
  },
);

export { router as getPollutionDataWithFilterRouter };
