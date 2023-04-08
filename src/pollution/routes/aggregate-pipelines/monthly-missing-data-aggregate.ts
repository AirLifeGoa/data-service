export  const monthlyMissingDataPipeline : any = [
            {
                $project: {
                    _id: {
                      year: {
                        $year: "$recordedAt",
                      },
                      month: {
                        $month: "$recordedAt",
                      },
                    },
                    data: "$data",
                }
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month",
                    },
                    PM10: {
                      $push: "$data.PM10",
                    },
                    PM25: {
                      $push: "$data.PM2.5",
                    },
                    NO2: {
                      $push: "$data.NO2",
                    },
                    SO2: {
                      $push: "$data.SO2",
                    },
                    O3: {
                      $push: "$data.O3",
                    },
                    Pb: {
                      $push: "$data.Pb",
                    },
                    CO: {
                      $push: "$data.CO",
                    },
                    AQI: {
                      $push: "$data.AQI",
                    },
                  }
            },
            {
                $project:{
                  _id:1,
                  "data.PM10": "$PM10",
                  "data.PM25": "$PM25",
                  "data.SO2": "$SO2",
                  "data.NO2": "$NO2",
                  "data.Pb": "$Pb",
                  "data.CO": "$CO",
                  "data.AQI": "$AQI",
                  "data.O3": "$O3",
                }
            },
            {
                $project: {
                    data: {
                      $map: {
                        input: {
                          $objectToArray: "$$ROOT.data",
                        },
                        as: "field",
                        in: {
                          metric: "$$field.k",
                          nullCount: {
                            $size: {
                              $filter: {
                                input: "$$field.v",
                                as: "item",
                                cond: {
                                  $eq: ["$$item", null],
                                },
                              },
                            },
                          },
                          total: { $size: "$$field.v" }
                        },
                      },
                    },
                }
            },           
            {
                $sort:{
                    "_id.year":1,
                    "_id.month": -1,
                }
            }
]

