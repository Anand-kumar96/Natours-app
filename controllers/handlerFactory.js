const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//DELETE
exports.deleteOne = (Model, collectionName) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No ${collectionName} found with this Id`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

// UPDATE
exports.updateOne = (Model, collectionName) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError(`No ${collectionName} found with this Id`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// CREATE
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) {
      return next(new AppError(`document can not be created`, 400));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

//GET ONE
exports.getOne = (Model, collectionName, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = Model.findById(req.params.id).populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No ${collectionName} found with this Id`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// GET ALL
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //total documents
    const totalDocs = await Model.countDocuments();
    // BUILDING QUERY
    const features = new APIFeatures(Model.find(filter), req.query, totalDocs)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTING QUERY
    // to see index behavior we use explain method on query
    // const doc = await features.query.explain();
    const doc = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
