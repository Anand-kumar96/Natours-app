const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');

// for uploading tourImages
const multerStorage = multer.memoryStorage();
//multer filter // to check file is image or not
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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

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
//upload.single('photo); // req.file
//upload.array('images',5);// req.files

//ALIAS FEATURES FOR=>top-5-cheap-tour // we can create n number of alias route
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price ratingsAverage, ';
  req.query.fields =
    'name, price, duration, difficulty, ratingsAverage, summary';
  next();
};
// using factory handler function
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'Tour', 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour, 'Tour');
exports.deleteTour = factory.deleteOne(Tour, 'Tour');

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const numTours = await Tour.countDocuments();
//   // BUILDING QUERY
//   const features = new APIFeatures(Tour.find(), req.query, numTours)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   // EXECUTING QUERY
//   const tours = await features.query;

//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours: tours
//     }
//   });
// });

//getTour
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //for populating tour guide
//   // const tour = await Tour.findById(req.params.id).populate('guides'); //=> handle by query middleware
//   // handling 404 error
//   if (!tour) {
//     return next(new AppError('No tour found with this Id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });

// //create Tour
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

// patch
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with this Id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });

//Delete
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with this Id', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

//AGGREGATION PIPELINE
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
      $sort: { avgPrice: 1 } //1 for ASC -1 for DECS
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      pipeLine
    }
  });
});

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
//tour-within/:distance/center/:latlng/unit/:unit
//tours-within/233/center/12.967234,77.702556/unit/km
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
