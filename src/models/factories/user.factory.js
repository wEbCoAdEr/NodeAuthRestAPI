const mongoose = require('mongoose');
const {faker} = require('@faker-js/faker');
const {User} = require('../../models'); // Update with the correct path to your models
const {logger} = require('../../utils');
const {coreHelper} = require("../../helpers"); // Import the logger utility

// Define the factory function to create fake users with the doctor role
const createFakeUser = async (role = null) => {
  const gender = faker.helpers.arrayElement(['male', 'female']);
  const userData = {
    name: faker.person.fullName({sex: gender.toLowerCase()}),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    contact_number: faker.phone.number(),
    password: coreHelper.hashString(faker.internet.password()),
    date_of_birth: faker.date.birthdate({min: 25, max: 60, mode: 'age'}),
    gender: gender,
    role: role ?? faker.helpers.arrayElement(['patient', 'doctor'])
  };
  return new User(userData);
};

// Function to run the factory and create users
const run = async (numUsers, role=null, returnRecords = false) => {
  try {

    // Create and insert fake users
    const users = [];
    for (let i = 0; i < numUsers; i++) {
      const fakeUser = await createFakeUser();
      users.push(fakeUser);
    }

    // Insert fake users
    await User.insertMany(users);

    logger.info(`${numUsers} users created successfully`);

    // Return user IDs
    if(returnRecords){
      return users.map(user => user._id);
    }

  } catch (err) {
    logger.error('Error creating users:', err);
  }
};

module.exports = { run }; // Export the run function
