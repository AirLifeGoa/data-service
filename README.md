
# AirLifeGoa - Pollution Service  

This service is part of AirLifeGoa project. This is the main backend service which interacts with frotend for all kinds of calss related to time series data and user data. This services has 2 services Auth Service & Pollution Sevice.

## Auth Service
Auth service manages all user related data. It provides functionality of 
 - Sign-in/Sign-up
 - Mail Verfication
 - Chaging Roles
 - Reset Password/Forgot Password
 - . It uses JWT for authention uses mongodb as DB to store all user data. Passwords are stores in a hashed format which is a result of hashing password &  some random salt.


## Pollution Service
Pollution service manages all data related taks. It provides functionality of 
 - daily, weekly, & monthly Historical data 
 - Forecsting data
 - Adding/Creating data sources
 - Adding datapoints of a datasources etc.





## Installation

USe Node version >= 18

```
  npm install
  npm start
```

This starts the server on port 3002, which can be changed in index.ts file.






## API Reference

Each routes example api call can be found in this postman project [here](here)


