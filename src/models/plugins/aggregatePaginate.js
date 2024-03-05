const { dbHelper } = require('../../helpers');

/**
 * Mongoose plugin for aggregating and paginating documents.
 * @param {mongoose.Schema} schema - Mongoose schema to which aggregation pagination will be added.
 */
const aggregatePaginate = (schema) => {
  /**
   * Adds aggregate pagination functionality to the schema's statics.
   * @param {Object[]} aggregationPipeline - Aggregation pipeline stages.
   * @param {Object} options - Pagination options.
   * @param {number} options.page - Current page number.
   * @param {number} options.limit - Maximum number of documents per page.
   * @param {string} options.sortBy - Sort criteria (e.g., 'createdAt:desc').
   * @param {Function} callback - Callback function to handle pagination result.
   * @returns {Promise<Object>} - Pagination result.
   */
  schema.statics.aggregatePaginate = async function(aggregationPipeline, options, callback) {
    // Extract options and set defaults
    const {
      page = 1, limit = 10, sortBy = 'createdAt:desc'
    } = options;

    // Calculate document skip value
    const skip = (page - 1) * limit;

    // Calculate pipeline document count
    const countPipeline = [...aggregationPipeline, { $count: 'count' }];
    const countResult = await this.aggregate(countPipeline);

    // Calculate total pages
    const count = countResult.length > 0 ? countResult[0].count : 0;
    const pages = Math.ceil(count / limit);

    // Generate sort query
    const sortQuery = dbHelper.generateSortQuery(sortBy);

    // Modify aggregation pipeline for pagination
    aggregationPipeline.push(
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute aggregation pipeline
    const documents = await this.aggregate(aggregationPipeline);

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

module.exports = aggregatePaginate;
