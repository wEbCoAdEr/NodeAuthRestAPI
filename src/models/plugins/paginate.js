/**
 * Adds pagination functionality to Mongoose schema.
 * @param {mongoose.Schema} schema - Mongoose schema to which pagination will be added.
 */
const paginate = (schema) => {
  /**
   * Custom paginate method added to the schema's statics.
   * @param {Object} filter - Query conditions.
   * @param {Object} options - Pagination options.
   * @param {number} options.page - Current page number.
   * @param {number} options.limit - Maximum number of documents per page.
   * @param {Array} options.populate - Array of fields to populate.
   * @param {Array} options.sortBy - Array of sort criteria.
   * @param {string} options.sortBy[].field - Field to sort by.
   * @param {string} options.sortBy[].order - Sort order ('asc' for ascending, 'desc' for descending).
   * @param {Function} callback - Callback function to handle pagination result.
   * @returns {Promise<Object>} - Pagination result.
   */
  schema.statics.paginate = async function(filter, options, callback) {
    // Extract options and set defaults
    const {
      page = 1, limit = 10, sortBy = 'createdAt:desc', populate = null
    } = options;

    // Generate document skip value
    const skip = (page - 1) * limit;

    // Generate sort query
    let sortQuery = '';
    let sortList = [];
    sortBy.split(',').forEach((sortItem) => {
      let sortItemArray = sortItem.split(':');
      if(Number(sortItemArray.length) === 2) {
        sortList.push((sortItemArray[1] === 'desc' ? '-' : '') + sortItemArray[0]);
      }
    });
    sortQuery = sortList.join(' ');

    // Initiate count and document promise
    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sortQuery).skip(skip).limit(limit);

    // Generate populate query
    if (populate) {
      populate.split(',').forEach((populateItem) => {
        let populateQuery = populateItem.split('.').reverse().reduce((accumulator, item) => {
          return {
            path: item,
            populate: accumulator
          };
        });
        docsPromise = docsPromise.populate(populateQuery);
      });
    }

    // Execute document promise
    docsPromise = docsPromise.exec();

    // Wait for count and document promises to resolve
    const [count, documents] = await Promise.all([countPromise, docsPromise]);

    // Calculate pagination metadata
    const result = {
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: documents
    };

    // Invoke callback if provided
    if (typeof callback === 'function') {
      callback(result);
    }

    return result;
  };
};

module.exports = paginate;
