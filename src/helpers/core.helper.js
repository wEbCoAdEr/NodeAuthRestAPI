const bcrypt = require("bcryptjs");
const config = require("../config");
/**
 * Picks specified properties from an object and returns a new object containing only those properties.
 * @param {Object} object - The object from which properties will be picked.
 * @param {string[]} keys - Array of property names to pick from the object.
 * @returns {Object} - New object containing only the picked properties.
 */
const pick = (object, keys) => {
  // Initialize an empty object to store picked properties
  const pickedObject = {};

  // Iterate over each property name in the keys array
  keys.forEach((key) => {
    // Check if the object has the property
    if (object.hasOwnProperty(key)) {
      // If the property exists, add it to the picked object
      pickedObject[key] = object[key];
    }
  });

  // Return the new object containing only the picked properties
  return pickedObject;
};


/**
 * Generates a hashed version of the input string using bcrypt.
 *
 * @param {string} string - The string to be hashed.
 * @return {string} The hashed version of the input string.
 */
const hashString = (string) => {
  const salt = bcrypt.genSaltSync(Number(config.HASH_SALT_ROUND));
  return bcrypt.hashSync(string, salt);
}

module.exports = {
  pick,
  hashString
}
