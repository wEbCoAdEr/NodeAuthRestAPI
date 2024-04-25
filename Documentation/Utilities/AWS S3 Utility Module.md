## AWS S3 Utility Module Documentation

This document describes the utility module for interacting with AWS S3 services within the boilerplate.  This module provides functionalities for uploading, listing, deleting files and folders, and generating signed download URLs for private files.

**Importing the module:**

```javascript
const { awsS3 } = require('../utils');
```

The `awsS3` object exposes various functions for S3 operations.

**Available Functions:**

1. **s3 (Object):**
    - This is the underlying AWS S3 client instance used by the other functions. You can access the raw S3 client for advanced use cases.

2. **normalizePath(path: string): string**
    - Normalizes a file path by ensuring it ends with a trailing slash (`/`).

3. **convertToNestedStructure(list: Array): Object**
    - Converts a flat list of S3 object keys and their metadata into a nested directory structure representing the directory and file hierarchy within the bucket.

4. **listFilesAndFolders(bucket: string, targetPath: string, nested: boolean = true): Promise<Object>**
    - Lists files and folders in a specified S3 bucket path.
        - **bucket (string):** The name of the S3 bucket.
        - **targetPath (string):** The target path within the bucket to list.
        - **nested (boolean, optional):** (Default: true) Flag to determine if nested metadata should be fetched for each listed object.
    - Returns a Promise resolving to an object representing the listed files and folders with their metadata.

5. **uploadFile(buffer: Buffer, fileData: Object): Promise<Object>**
    - Uploads a file to an AWS S3 bucket.
        - **buffer (Buffer):** The file data buffer to be uploaded.
        - **fileData (Object):** Information about the file to be uploaded.
            - **privacy (string):** The privacy setting of the file ('Private' or 'Public').
            - **filePath (string):** The path of the file in the S3 bucket.
            - **metaData (Object, optional):** Optional metadata to be added to the S3 object.
    - Returns a Promise resolving to the `fileData` object, including the `downloadURL` if applicable for public files.

6. **transferFileToS3(fileData: Object, metaData: Object): Promise<Object>**
    - Transfers a file from the local server to an AWS S3 bucket.
        - **fileData (Object):** Information about the file to be transferred.
            - **privacy (string):** The privacy setting of the file ('Private' or 'Public').
            - **filePath (string):** The path of the file in the S3 bucket.
            - **localPath (string):** Local path of the file on the server.
        - **metaData (Object, optional):** Optional metadata to be added to the S3 object.
    - Returns a Promise resolving to the S3 upload data upon success.

7. **deleteFileAndFolder(pathToDelete: string, bucketName: string): Promise<Object>**
    - Deletes a file or folder from an AWS S3 bucket.
        - **pathToDelete (string):** The path of the file or folder to delete.
        - **bucketName (string):** The name of the S3 bucket.
    - Returns a Promise resolving with the response from the S3 deleteObject operation.
    - Throws an `ApiError` if an error occurs during the delete operation.

8. **getPrivateFileDownloadURL(filePath: string): Promise<string>**
    - Generates a signed URL for private file download from an AWS S3 bucket.
        - **filePath (string):** The path of the file in the S3 bucket.
    - Returns a Promise resolving with the signed URL.
    - Throws an `ApiError` if an error occurs during the process.


**Note:**

* This module utilizes environment variables or a configuration file for credentials and region settings. Ensure these configurations are set up before using the module.
* The module utilizes an `ApiError` class for throwing errors. Refer to the error handling documentation for details on handling these errors.


By utilizing the provided functions in this module, you can seamlessly integrate various S3 operations within your controllers and services.
