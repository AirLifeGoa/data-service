// import { aggregateType } from './aggregates';
//
// const filterWeekly = (dataSourceId: string, startDate: Date, endDate: Date, aggregate: aggregateType, pageNumber = 1, pageSize = 100) => {
//
//   // filter duplicate data based on recodedAt and metadata.sourceId
//   // in case of duplicates take the one which has latest metadata.addedAt
//   // get data on per week basis from database
//   // use aggregation pipeline
//   // sort in descending order of timestamp which is recordedAt field
//   // do field wise aggregation for metrics which is in data field
//
//
//   const pipeline = [
//     {
//       $match: {
//         'metadata.dataSourceId': dataSourceId,
//         recordedAt: {
//           $gte: startDate,
//           $lte: endDate,
//         },
//       },
//     },
//     {
//       $sort: {
//         'metadata.addedAt': -1,
//       },
//     },
//     {
//       $group: {
//         _id: {
//           recordedAt: '$recordedAt',
// sourceId: '$metadata.sourceId',
//         },
//         data: {
//           $first: '$$ROOT',
//         },
//       },
//     },
//     {
//       $replaceRoot: {
//         newRoot: '$data',
//       },
//     },
//     {
//       $sort: {
//         recordedAt: -1,
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         id: '$_id',
//         timestamp: 1,
//         data: 1,
//         metadata: 1,
//
//         }
//         }
//       }
//   return pipeline;
// };
