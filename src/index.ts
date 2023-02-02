import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {

  if (!process.env.JWT_KEY) {
    // process.env.JWT_KEY = 'asdf';
    throw new Error('No JWT_KEY defined');
  }

  try {
    await mongoose.connect('mongodb+srv://divyanx:airlifegoa@cluster0.hbuq2jq.mongodb.net/?retryWrites=true&w=majority');

    // await mongoose.connect('mongodb://pollution-service-mongo-srv:27017/pollution');
    // await mongoose.connect('mongodb://localhost:27017/pollution');
    // await mongoose.connect('mongodb://airlifegoa.dev:27017/auth');

    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start();
