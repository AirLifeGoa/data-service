// // import { aggregateType } from './aggregates';
// //
// // const filterWeekly = (dataSourceId: string, startDate: Date, endDate: Date, aggregate: aggregateType, pageNumber = 1, pageSize = 100) => {
// //
// //   // filter duplicate data based on timestamp and metadata.sourceId
// //   // get data on per week basis from database
// //   // use aggregation pipeline
// //   // sort in descending order of timestamp which is recordedAt field
// //   // for the week which has more than one data, give the one based on aggregate which can be average, for each pollutant or highest for each pollutant or lowest for each pollutant
// //
// //
// //   const pipeline = [
// //     {
// //       $match: {
// //         'metadata.dataSourceId': dataSourceId,
// //         recordedAt: {
// //           $gte: startDate,
// //           $lte: endDate,
// //         },
// //       },
// //     },
// //     {
// //       $sort: {
// //         recordedAt: -1,
// //       },
// //     },
// //     {
// //       $group: {
// //         _id: {
// //           recordedAt: {
// //             $dateToString: {
// //               format: '%Y-%m-%d',
// //               date: '$recordedAt',
// //             },
// //           },
// //           sourceId: '$metadata.sourceId',
// //         },
// //         data: {
// //           $first: '$$ROOT',
// //         },
// //       },
// //     },
// //     {
// //       $replaceRoot: {
// //
// //             }
// //           }
// //         }
// //         }
// //       }
// //   ];
//
//   return pipeline;
// };
