const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// UPLOAD TOUR IMAGE USING MULTER
const multerStorage = multer.memoryStorage();
// to check uploading file is image type or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!. Please upload only images', 400), false);
  }
};
//multer middleware
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
//upload.single('photo); // req.file
//upload.array('images',5);// req.files
// for mixed use fields
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
// resizing image middleware
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1 Cover Image
  const imageCoverFilename = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  // since in updateOne we are updating all in body so we set it
  req.body.imageCover = imageCoverFilename;

  //2 Images
  const images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tours-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      images.push(filename);
    })
  );
  req.body.images = images;
  next();
});

// TOP 5 CHEAP TOUR
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price ratingsAverage, ';
  req.query.fields =
    'name, price, duration, difficulty, ratingsAverage, summary';
  next();
};

// ALL ENDPOINTS USING HANDLE FACTORY FUNCTION
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'Tour', 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour, 'Tour');
exports.deleteTour = factory.deleteOne(Tour, 'Tour');

//GET TOUR STATS => AGGREGATION PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
  const pipeLine = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        totalTours: { $sum: 1 },
        totalRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      pipeLine
    }
  });
});

//GET MONTHLY PLAN ENDPOINTS
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    total: monthlyPlan.length,
    data: {
      monthlyPlan
    }
  });
});

// FOR MAP
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //mi or km
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in format of lat, lang',
        400
      )
    );
  }
  // console.log(radius);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// TO CALCULATE DISTANCE
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in format of lat, lang',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier // to convert in km / miles
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
