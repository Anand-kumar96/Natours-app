const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    //parent Referencing ..........
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// to preventing duplicate review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// populating user and tour using query middleware
reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'tour', // since in referencing i used user and tour so inside i am pointing User and Tour model
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });
  //we turn off tour because while populating tour it gives extra info since we already have
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});
//statics method to calculate averageRating => it will take tour id => in static method this return Model
reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    // 1st stage match tour and find out
    {
      $match: { tour: tourId }
    },
    // calculate statics them self
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);
  // to save it in Tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};
//this statics function called by middleware when any review is created
reviewSchema.post('save', function() {
  //this point to current review =>and function present on Model Review but Review Model not defined yet => to solve use this.constructor which point to created document i.e. Review
  this.constructor.calcAverageRating(this.tour);
});

// to update and delete review calculation
//since query is already executed we can't use above pre middleware to find document so we create another
//for => findByIdAndUpdate , findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
// now after update tour
reviewSchema.post(/^findOneAnd/, async function() {
  //await this.findOne(); does Not work here since query already executed
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
