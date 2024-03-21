/**
 * Module for initializing Handlebars templating engine.
 * @module handlebars
 */

// Import dependencies
const {engine} = require('express-handlebars');
const path = require('path');

/**
 * Initialize Handlebars templating engine with the provided Express app instance.
 * @param {Object} app - The Express app instance.
 */
const initializeHandlebars = (app) => {

  // Configure Express Handlebars
  app.set('view engine', 'hbs');
  app.engine('hbs', engine({extname: '.hbs'}));

  // Set views directory
  app.set('views', path.join(__dirname, '../views'));

};

// Export the initializeHandlebars function
module.exports = initializeHandlebars;
