const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
// const compression = require('compression');
// const cors = require('cors');

const bookingRouter = require('./routes/bookingRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const viewRouter = require('./routes/viewRoutes');
const { globalErrorHandler } = require('./controllers/errorController');
const { webhookCheckout } = require('./controllers/bookingController');

const app = express();
// view template engine setting i.e pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Global Middleware

//Access-control-allow-Origin
// app.use(cors()); // implement Cors
//serving static file
app.use(express.static(path.join(__dirname, 'public')));

// SET SECURITY HTTP HEADERS
app.use(helmet());

// to work map
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com/'
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com/',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

//set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);

// LIMIT REQUEST FROM SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request with same IP. please try again in an hour.'
});
app.use('/api', limiter); // applicable on all routes start with api
// we need the body in raw form so i used here
app.post(
  '/checkout-session',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);
//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ALL PARSER and OTHER MIDDLEWARE
app.use(express.json({ limit: '10kb' })); //BODY PARSER
app.use(cookieParser()); //cookie -parse
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // DATA PARSER FROM FORM
app.use(mongoSanitize()); //Data Sanitization against NO SQL query injection
app.use(xss()); //Data Sanitization against XSS
// app.use(compression());
//prevent parameter population
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  // console.log(req.cookies);
  next();
});

// Middleware for mounting routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

// Global Error handling MiddleWare
app.use(globalErrorHandler);

module.exports = app;
