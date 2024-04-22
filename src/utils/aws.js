const AWS = require("aws-sdk");
const httpStatus = require('http-status');
const stream = require('stream');
const fs = require("fs");
const config = require('../config');
const {ApiError} = require('../utils');

// Initialize AWS SDK with configured credentials and region
AWS.config.update({
  accessKeyId: config.AWS_S3_ACCESS_KEY,
  secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
  region: config.AWS_S3_BUCKET_REGION
});

// Create an instance of AWS S3 service for performing S3 operations
const s3 = new AWS.S3();

/**
 * Determine the S3 bucket name based on file privacy setting.
 *
 * @param {string} privacy - Privacy setting of the file.
 * @returns {string} - S3 bucket name corresponding to the privacy setting.
 */
const getBucketByPrivacy = (privacy) => {
  return privacy === 'private' ? config.AWS_S3_BUCKET_NAME : config.AWS_S3_PUBLIC_BUCKET_NAME;
};

/**
 * Uploads a file to an AWS S3 bucket.
 *
 * @param {Buffer} buffer - The file data buffer to be uploaded.
 * @param {Object} fileData - Information about the file to be uploaded.
 * @param {string} fileData.privacy - The privacy setting of the file ('Private' or 'Public').
 * @param {string} fileData.filePath - The path of the file in the S3 bucket.
 * @param {Object|null} fileData.metaData - Optional metadata to be added to the S3 object.
 * @returns {Promise<Object>} - A promise that resolves with the fileData object, including the downloadURL if applicable.
 */
const uploadFile = async (buffer, fileData) => {
  // Destructure the necessary properties from the fileData object
  const { privacy, filePath, metaData } = fileData;

  // Create a pass-through stream to pipe the buffer data
  const passThroughStream = new stream.PassThrough();

  // Set the parameters for the S3 upload
  const params = {
    Bucket: getBucketByPrivacy(privacy),
    Key: filePath,
    Body: passThroughStream,
    ...(metaData && { Metadata: metaData }),
  };

  try {
    // Upload the file to S3 and get a promise
    const uploadPromise = s3.upload(params).promise();

    // Pipe the buffer stream to the pass-through stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(passThroughStream);

    // Wait for the upload promise to resolve
    const data = await uploadPromise;

    // Set the downloadURL property for public files
    if (privacy === 'Public') {
      fileData.downloadURL = data.Location;
    }

    return fileData;
  } catch (error) {
    // Throw an ApiError with the internal server error status code and the original error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Transfer a file to AWS S3 bucket.
 *
 * @param {Object} fileData - Information about the file to be transferred.
 * @param {string} fileData.privacy - Privacy setting of the file.
 * @param {string} fileData.filePath - Path of the file in the S3 bucket.
 * @param {string} fileData.localPath - Local path of the file on the server.
 * @param {Object|null} metaData - Optional metadata to be added to the S3 object.
 * @returns {Promise<Object>} - Promise that resolves with S3 upload data upon success.
 */
const transferFileToS3 = async (fileData, metaData) => {

  // Destructure the necessary properties from the fileData object
  const {privacy, filePath, localPath} = fileData;

  try {
    // Create a read stream from the local file
    const readStream = fs.createReadStream(localPath);

    // Set the parameters for the S3 upload
    const params = {
      Bucket: getBucketByPrivacy(privacy), // Get the S3 bucket based on the privacy setting
      Key: filePath, // Set the S3 object key
      Body: readStream, // Set the body of the S3 upload to the read stream
      ...(metaData && { Metadata: metaData }), // Add optional metadata if provided
    };

    // Upload the file to S3 and wait for the promise to resolve
    const uploadPromise = s3.upload(params).promise();
    const data = await uploadPromise;

    // Return the S3 upload data
    return data;
  } catch (error) {
    // Throw an ApiError with the internal server error status code and the original error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Deletes a file or folder from an AWS S3 bucket.
 *
 * @param {string} pathToDelete - The path of the file or folder to delete.
 * @param {string} bucketName - The name of the S3 bucket.
 * @returns {Promise<Object>} - A promise that resolves with the response from the S3 deleteObject operation.
 * @throws {ApiError} - If an error occurs during the delete operation.
 */
const deleteFileAndFolder = async (pathToDelete, bucketName) => {
  try {

    // Normalize the path with a trailing slash if needed
    const normalizedPath = pathToDelete.endsWith("/") ? pathToDelete : `${pathToDelete}/`;

    // Set the parameters for the S3 delete operation
    const params = {
      Bucket: bucketName,
      Key: normalizedPath,
    };

    // Delete the folder or file and return the response
    const deleteResponse = await s3.deleteObject(params).promise();
    return deleteResponse;

  } catch (error) {
    // Throw an ApiError with the internal server error status code and the original error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};


module.exports = {
  s3,
  uploadFile,
  transferFileToS3,
  deleteFileAndFolder
};
