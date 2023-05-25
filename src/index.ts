import mongoose from 'mongoose';
import { app } from './app';
import dev_config from './dev-config.json';

const start = async () => {
  if (!process.env.JWT_KEY) {
    process.env.JWT_KEY = 'asdf';
    // throw new Error('No JWT_KEY defined');
  }

  try {
    await mongoose.connect(
      'mongodb+srv://divyanx:<password>@cluster0.hbuq2jq.mongodb.net/?retryWrites=true&w=majority',
    );
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(dev_config['port'], () => {
    console.log(`Listening on port ${dev_config['port']}!`);
  });
};

start();
