/**
 * Utility module for interacting with AWS S3 services within the boilerplate.
 * This module provides functionalities for uploading, listing, deleting files and folders,
 * and generating signed download URLs for private files.
 *
 * @module awsS3
 */

// Load required dependencies
const AwsS3 = require("aws-sdk");
const httpStatus = require('http-status');
const stream = require('stream');
const fs = require("fs");
const config = require('../config');
const {ApiError} = require('../utils');

// Initialize AwsS3 SDK with configured credentials and region
AwsS3.config.update({
  accessKeyId: config.AWS_S3_ACCESS_KEY,
  secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
  region: config.AWS_S3_BUCKET_REGION
});

// Create an instance of AwsS3 S3 service for performing S3 operations
const s3 = new AwsS3.S3();


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
 * Normalizes a file path by ensuring it ends with a trailing slash.
 *
 * @param {string} path - The file path to normalize.
 * @return {string} The normalized file path.
 */
const normalizePath = (path) => {
  return path.endsWith("/") ? path : `${path}/`;
}


/**
 * Converts a flat list of S3 object keys and their metadata into a nested directory structure.
 *
 * @param {Array} list - The list of S3 object keys with metadata.
 * @returns {Object} - A nested structure representing the directory and file hierarchy.
 */
const convertToNestedStructure = (list) => {
  const result = {};

  list.forEach((item) => {
    const parts = item.key.split("/");
    let current = result;
    let path = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      path += part + "/";

      if (!current[part]) {
        current[part] = {
          type: i === parts.length - 1 ? "file" : "directory",
          path: path,
        };

        // Add metadata and size to file items
        if (i === parts.length - 1) {
          current[part].metaData = item.metaData || {};
          current[part].size = item.size || 0;
          current[part].lastModified = item.lastModified || null;
        }

        if (i !== parts.length - 1) {
          current[part].items = {};
        }
      }

      current = current[part].items;
    }
  });

  return result;
};


/**
 * List files and folders in a specified S3 bucket path.
 * @param {string} bucket - The name of the S3 bucket.
 * @param {string} targetPath - The target path within the bucket to list.
 * @param {boolean} nested - Flag to determine if nested metadata should be fetched (default true).
 * @returns {Promise<Object>} - Promise resolving to the list of files and folders with metadata.
 */
const listFilesAndFolders = async (bucket, targetPath, nested = true) => {
  // Ensure the path ends with a '/'
  const normalizedPath = normalizePath(targetPath);

  const params = {
    Bucket: bucket,
    Prefix: normalizedPath,
  };

  try {
    // List objects in the specified S3 path
    const data = await s3.listObjectsV2(params).promise();

    if (!nested) {
      return data; // Return raw S3 objects if nested flag is false
    }

    // Extract keys from S3 object list
    const keys = data.Contents.map((item) => item.Key);

    // Fetch metadata for each object using parallel promises
    const objectsWithMetadata = await Promise.all(
      keys.map(async (key) => {
        const headParams = {
          Bucket: bucket,
          Key: key,
        };
        try {
          const headData = await s3.headObject(headParams).promise();
          return {
            key: key,
            metaData: headData.Metadata,
            size: headData.ContentLength,
            lastModified: headData.LastModified,
          };
        } catch (error) {
          return {
            key: key,
            metadata: {}, // Return an empty object if metadata fetch fails
            size: 0,
          };
        }
      })
    );

    // Convert flat list of objects with metadata to a nested structure
    return convertToNestedStructure(objectsWithMetadata);

  } catch (error) {
    // Throw an ApiError with the internal server error status code and the original error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};


/**
 * Uploads a file to an AwsS3 S3 bucket.
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
  const {privacy, filePath, metaData} = fileData;

  // Create a pass-through stream to pipe the buffer data
  const passThroughStream = new stream.PassThrough();

  // Set the parameters for the S3 upload
  const params = {
    Bucket: getBucketByPrivacy(privacy),
    Key: filePath,
    Body: passThroughStream,
    ...(metaData && {Metadata: metaData}),
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
 * Transfer a file to AwsS3 S3 bucket.
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
      ...(metaData && {Metadata: metaData}), // Add optional metadata if provided
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
 * Deletes a file or folder from an AwsS3 S3 bucket.
 *
 * @param {string} pathToDelete - The path of the file or folder to delete.
 * @param {string} bucketName - The name of the S3 bucket.
 * @returns {Promise<Object>} - A promise that resolves with the response from the S3 deleteObject operation.
 * @throws {ApiError} - If an error occurs during the delete operation.
 */
const deleteFileAndFolder = async (pathToDelete, bucketName) => {
  try {

    // Normalize the path with a trailing slash if needed
    const normalizedPath = normalizePath(pathToDelete);

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


/**
 * Generates a signed URL for private file download from an AwsS3 S3 bucket.
 *
 * @param {string} filePath - The path of the file in the S3 bucket.
 * @returns {Promise<string>} - A promise that resolves with the signed URL.
 * @throws {ApiError} - If an error occurs during the process.
 */
const getPrivateFileDownloadURL = async (filePath) => {
  try {
    // Set the parameters for generating the signed URL
    const params = {
      Bucket: config.AWS_S3_BUCKET_NAME, // The name of the S3 bucket
      Key: filePath, // The path of the file in the S3 bucket
      Expires: config.AWS_S3_PRIVATE_FILE_DOWNLOAD_URL_EXPIRATION_TIME, // The expiration time for the signed URL
    };

    // Generate the signed URL using the AwsS3 SDK
    return await s3.getSignedUrlPromise("getObject", params);
  } catch (error) {
    // Throw an ApiError with the internal server error status code and the original error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};


module.exports = {
  s3,
  normalizePath,
  convertToNestedStructure,
  listFilesAndFolders,
  uploadFile,
  transferFileToS3,
  deleteFileAndFolder,
  getPrivateFileDownloadURL
};
