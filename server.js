const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

colors.enable();
// handling uncaught exception => it should be top of code so that it can handle any where inside code
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥💥💥. shutting down...');
  console.log(err.name, err.message); // in node js err have name and message in each case always
  process.exit(1); //0 means success 1 means unhandled // crashing application
});

dotenv.config({ path: './config.env' });
// this command read all variable and saved in nodejs => this should above app import
const app = require('./app');

const { PORT } = process.env;

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
// connecting to database
// .connect(process.env.DATABASE_LOCAL, {    // atlas connection   // local data base connection => remaining same
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
/*
//creating documents and testing model
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997
});
// testTour variable provide some method  which can use to intract with database testTour.save() return a promise

testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('ERROR💥 :', err);
  });
*/
const server = app.listen(PORT, () => {
  console.log(`app is running at port: ${PORT}.........`);
});

// handling unhandled rejection
// using event listener
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥💥💥. shutting down...');
  console.log(err.name, err.message); // in node js err have name and message in each case always
  /*
  process.exit();
  // but it's not good way to directly exit first let complete all request to server then close
  // so better to use like that
  */
  server.close();
  process.exit(1); //0 means success 1 means unhandled // crashing application
});

// console.log(x);// uncaught exception if we put in middleware then when we request it give error
