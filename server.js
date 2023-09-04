const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const app = require('./app');

colors.enable(); // show Logs in terminal Color wise
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥💥💥. shutting down...');
  console.log(err.name, err.message); // in node js err have name and message in each case always
  process.exit(1); //0 means success 1 means unhandled // crashing application
});

dotenv.config({ path: './config.env' });
const { PORT } = process.env;

// CONNECTING DATABASE
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection Successful'.yellow.inverse);
  })
  .catch(err => {
    throw err;
  });
const server = app.listen(PORT, () => {
  console.log(`app is running at port: ${PORT}.........`);
});

// Handling unhandled rejection => using event listener
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥💥💥. shutting down...');
  console.log(err.name, err.message);
  server.close();
  process.exit(1);
});
