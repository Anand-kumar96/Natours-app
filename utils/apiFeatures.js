class APIFeatures {
  constructor(query, queryString, numTours) {
    this.query = query;
    this.queryString = queryString;
    this.numTours = numTours;
  }

  //FILTERING FEATURES
  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObject[el]);
    //1B)ADVANCE FILTERING FOR QUERY OPERATOR gte,lte,gt,lt
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  //SORTING FEATURES
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  //FIELDS FEATURES
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  //PAGINATION FEATURES
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    if (this.queryString.page) {
      if (skip >= this.numTours) throw new Error('This Page does not exist');
    }
    return this;
  }
}
module.exports = APIFeatures;
