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

module.exports = {
  generateSortQuery
}
