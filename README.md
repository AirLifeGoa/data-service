# AirLifeGoa - Pollution Service  

This service is part of the AirLifeGoa project. This is the main backend service that interacts with the front end for all kinds of classes related to time series data and user data. This service has 2 services Auth Service & Pollution Service.

## Auth Service
Auth service manages all user-related data. It provides the functionality of 
 - Sign-in/Sign-up
 - Mail Verification
 - Changing Roles
 - Reset Password/Forgot Password
 - It uses JWT for authentication and uses MongoDB as DB to store all user data. Passwords are stored in a hashed format which is a result of hashing passwords &  some random salt.


## Pollution Service
The pollution service manages all data-related tasks. It provides the functionality of 
 - daily, weekly, & monthly Historical data 
 - Forecasting data
 - Adding/Creating data sources
 - Adding data points of data sources etc.

Mongodb is used for storing both time series and user data. MongoDB's latest version is optimized for storing time series data.

## CodeBase walkthrough 
The walkthrough video for entire codebase is uploaded in the AirLifeGoa youtube channel [here](https://www.youtube.com/@AirLifeGoa). 
 

## Installation

Use Node version >= 18

```
  npm install
  npm start
```

The server will start on port 3002, which can be changed in the index.ts file.






## Auth - API Reference

Each routes example API call can be found in this postman project [here](here)

Below are some important and mostly used routes
```http
  POST /api/users/sign in
```
  This API call is used for user sign-in.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required** Email to register |
| `password` | `string` | **Required**  Password |

```http
  POST /API/users/signup
```
  This API call is used for user sign-in.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required** Email to register |
| `password` | `string` | **Required**  Password |
| `firstName` | `string` |  **Required** Name | 

```http
  POST api/users/change-roles
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `userId` | `string` | **Required** Email to register |
| `newRole` | `string` | **Required**  Role to change ex: user -> admin |
| `setTo` | `boolean` |  **Required** if set to true role updates/promotes if set to false roles gets demoted like admin -> user | 


## Pollution - API Reference

Below are some important and mostly used routes.        
1. 
```http
  POST /api/pollution/datasource/create
```
  This API call is used to create a new data source.

Example request body
``` 
{
    "id": 18,
    "name": "iitgoa-hostel-3",
    "location": {
        "lat": 14.696700,
        "lng": 124.486050,
        "address": "IIT Goa Hostel 2, Farmagudi, Ponda, Goa, 403401"
    },
    "type": "manual",
    "description": "data source for collecting data in iit goa hostel by students",
    "metrics": [
        "PM10",
        "PM2.5",
        "O2",
        "Wind"
    ],
    "expectedFrequencySeconds": 15,
    "expectedFrequencyType": "seconds"
}
```

2. 
```http
  POST /api/pollution/data
```
  This API call is used for adding new data of a data source.

Example request body
```
[
    {
        "recordedAt": "2017-04-04T00:00:00+05:30",
        "data": {
            "SO2": 4,
            "NO2": null,
            "PM10": 46,
            "O3": 0,
            "PM2.5": 0,
            "Pb ": 0
        },
        "metadata": {
            "dataSourceId": "1"
        }
    },
    ...
    ...
]

3. 
```http
  POST /api/pollution/data/filter/{dataSourceId}
```
  This API call is used for querying the data of a data source.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `startDate` | `Date` | **Required**  startDate of data to retrive ex: 2016-04-05 |
| `endDate` | `Date` | **Required**   endDate of data to retrive ex: 2022-04-05 |
| `filter` | `string` |  **Required**  one of these ["daily", "weekly", "monthly"]| 
| `stats` | `string` |  **Required** one of these ["avg", "min", "max"]|

4. 
```http
  POST /api/pollution/prediction/{dataSourceId}
```
This API call is used for querying the prediction data of a data source.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `startDate` | `Date` | **Required**  startDate of data to retrive ex: 2017-08-23T00:00:00.000+00:00 |
| `endDate` | `Date` | **Required**   endDate of data to retrive ex: 2023-05-12T10:51:04.000+00:00 |
| `modelName` | `string` |  **Required**  one of these ["prophet", "lstm", "hbridlstm"]| 

5. 
```http
  GET /api/pollution/metricdata/{dataSourceId}?metric={metric}
```
This API call is used for querying metric data like pm10, so2, etc of a data source.

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `dataSourceId` | `number` | **Required**  Id of a datasource |
| `metric` | `string` | **Required**  it one of the metric data stored by datasource |

## Contributing

We welcome contributions of any size! please follow the github issues page to get more info about taking on new tasks.

Got stuck. For any more info contact us

Divyansh K - 6 two O 4 Nine Nine ! Eight 0 O or mail at - me@divyanx.com        
Pranav B - 9 Three 9 0 O Six 2 Four 8 Zero  or mail at - pranavbalijapelly@gmail.com
