const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('../model/userModel');
// const validator = require('validator');
// creating schema with type option
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      minlength: [12, 'A name should have length greater than 12']
      // validate: [validator.isAlpha, 'name should have only alphabet']
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group Size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        // instead hard write difficult
        message: 'difficulty type not supported'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // setter function to round value
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      // custom validation for price not work for update it only work for creating new document

      // validate: function(val) {
      //   return this.price >= val;
      // }
      //with custom error
      validate: {
        validator: function(val) {
          return this.price >= val;
        },
        message: 'MAX DISCOUNT {VALUE} SHOULD BE LESS THAN PRICE'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    // GeoSpatial data
    startLocation: {
      //GeoJson this object is for properties not schema types
      type: {
        //type have Schema type option
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //for coordinate longitude(vertical) then latitude(horizontal)
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number], //for coordinate longitude then latitude
        address: String,
        description: String,
        day: Number
      }
    ],
    // modeling tour guides => embedding
    // guides: Array // embedding way

    //child reference
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  // adding for virtuals
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// for indexes on query in mongoDB
// tourSchema.index({ price: 1 }); //single indexing
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound indexing
tourSchema.index({ slug: 1 }); //compound indexing
tourSchema.index({ startLocation: '2dsphere' }); //geoSpacial index

// Virtual Properties => execute every get call
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtual Populate => child referencing review

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//1 DOCUMENT MIDDLEWARE => pre run before .save() or .create(), validate,remove
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name);
  next();
});
// slugify is a function that converts a string to a URL-friendly slug format
/*
// modeling tour guides => embedding / how embedding work ---------------------------------------------
// => it has drawback i.e. if guides update something then we have to check tour that guide present or not then update
tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

// creating query middleware for populating getTour and getAllTours
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt '
  });
  next();
});

// creating model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

// Date is data type=> Date.now() give current timestamp
//startDate: [Date] => mongo automatically parse the date => 2022-09-25 =>25 or 2022-09-25,11:43 =>25
