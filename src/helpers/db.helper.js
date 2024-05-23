const {Types} = require("mongoose");
const {BAD_REQUEST} = require("http-status");
const {ApiError} = require("../utils");

/**
 * Generates a sort query based on the sortBy string.
 * @param {string} sortBy - Sort criteria string (e.g., 'createdAt:desc').
 * @returns {string} - Sort query to be used in Mongoose queries.
 */
const generateSortQuery = (sortBy) => {
  // Initialize an array to store sort criteria
  let sortList = [];

  // Split the sortBy string by comma and iterate over each sort item
  sortBy.split(',').forEach((sortItem) => {
    // Split each sort item by colon to separate field and order
    let sortItemArray = sortItem.split(':');

    // Check if the sort item contains both field and order
    if (sortItemArray.length === 2) {
      // Construct the sort criteria and push it to the sort list
      sortList.push((sortItemArray[1] === 'desc' ? '-' : '') + sortItemArray[0]);
    }
  });

  // Join the sort criteria into a single string and return
  return sortList.join(' ');
}


/**
 * Checks if the given id is a valid ObjectId.
 *
 * @param {string} id - The id to be checked.
 * @return {boolean} Returns true if the id is a valid ObjectId, false otherwise.
 */
const isValidObjectId = (id) => {
  return Types.ObjectId.isValid(id);
}


/**
 * Checks if the given id is a valid ObjectId and throws an error if not.
 *
 * @param {string} id - The id to be checked.
 * @return {boolean} Returns true if the id is a valid ObjectId, false otherwise.
 */
const validateObjectId = (id) => {
  // Validate the threadId format before making the query
  if (!isValidObjectId(id)) {
    throw new ApiError(BAD_REQUEST, 'Invalid object id format');
  }
}

module.exports = {
  generateSortQuery,
  isValidObjectId,
  validateObjectId
}
