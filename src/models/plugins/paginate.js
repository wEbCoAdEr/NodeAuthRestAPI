/**
 * Adds pagination functionality to Mongoose schema.
 * @param {mongoose.Schema} schema - Mongoose schema to which pagination will be added.
 */
const paginate = (schema) => {
  /**
   * Custom paginate method added to the schema's statics.
   * @param {Object} query - Query conditions.
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
  schema.statics.paginate = async function(query, options, callback) {
    // Extract options and set defaults
    const {
      page = 1, limit = 10, populate = [], sortBy = [{ field: 'createdAt', order: 'desc' }]
    } = options;

    // Generate document skip value
    const skip = (page - 1) * limit;

    // Generate sort query
    let sortQuery = '';
    let sortList = [];
    sortBy.forEach((sortItem) => {
      const { field, order } = sortItem;
      sortList.push((order === 'desc' ? '-' : '') + field);
    });
    sortQuery = sortList.join(' ');

    // Initiate count and document promise
    const countPromise = this.countDocuments(query).exec();
    let docsPromise = this.find(query).sort(sortQuery).skip(skip).limit(limit);

    // Generate populate query
    if (populate.length > 0) {
      populate.forEach((populateItem) => {
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
