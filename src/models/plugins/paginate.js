const { dbHelper } = require('../../helpers');

/**
 * Adds pagination functionality to Mongoose schema.
 * @param {mongoose.Schema} schema - Mongoose schema to which pagination will be added.
 */
const paginate = (schema) => {
  /**
   * Adds pagination functionality to the schema's statics.
   * @param {Object} filter - Query filter.
   * @param {Object} options - Pagination options.
   * @param {number} options.page - Current page number.
   * @param {number} options.limit - Maximum number of documents per page.
   * @param {string} options.sortBy - Sort criteria (e.g., 'createdAt:desc').
   * @param {string|null} options.populate - Comma-separated list of fields to populate.
   * @param {Function} callback - Callback function to handle pagination result.
   * @returns {Promise<Object>} - Pagination result.
   */
  schema.statics.paginate = async function(filter, options, callback) {
    // Extract options and set defaults
    const {
      page = 1, limit = 10, sortBy = 'createdAt:desc', populate = null
    } = options;

    // Calculate document skip value
    const skip = (page - 1) * limit;

    // Generate sort query
    const sortQuery = dbHelper.generateSortQuery(sortBy);

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

    // Calculate total pages
    const pages = Math.ceil(count / limit);

    // Calculate pagination metadata
    const result = {
      count,
      pages,
      page,
      limit,
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