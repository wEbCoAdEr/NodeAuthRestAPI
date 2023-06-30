
# Node Auth Rest API

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Node Auth Rest API is an open-source authentication RESTful API built with Node.js, Express, and MongoDB. It provides user registration, login, token generation, and logout functionality, allowing developers to easily integrate authentication into their Node.js applications. This API can serve as a standalone authentication system or be used as a boilerplate for building Node.js applications with pre-implemented authentication.

## Features

- User registration with validation
- User login with username and password with validation
- JWT token generation for authentication
- JWT Token-based authentication using access and refresh tokens
- Token refresh endpoint for generating new access tokens
- Secure password storage using bcrypt hashing
- MongoDB for data storage
- Error handling middleware for consistent error responses
- Input validation using Joi
- Implemented application structure

## Requirements

- Node.js (v12 or higher)
- MongoDB database

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wEbCoAdEr/NodeAuthRestAPI.git
   ```
2.  Navigate to the project directory:
       ```bash
    cd node-auth-rest-api
    ```
    
3.  Install the dependencies:
       ```bash
    npm install
    ```
    
4.  Set up the environment variables:
    
    -   Rename the `.env.example` file to `.env`.
    -   Modify the `.env` file and provide the necessary configuration values (e.g., database connection URI, tokens secrets, etc.).

5.  Start the application:
    
       ```bash
    npm run dev
    ```
    
    The server will start running on `http://localhost:4000`. You can configure the port in `.env` file.
    


##  Testing the APIs

To test the functionality of the Node Auth Rest API, you can use the Postman collections provided in the "Postman Collection" directory. These collections contain pre-configured requests that can be easily executed to interact with the API endpoints.

Follow the steps below to import and use the Postman collections:

1.  Locate the "Postman Collection" directory in the project.
2.  Open the Postman application.
3.  Click on the "Import" button in the top left corner of the Postman interface.
4.  In the import window, select the option to "Import File" and browse to the "Postman Collection" directory.
5.  Select the desired Postman collection file (e.g., "NodeAuthRestAPI.postman_collection.json") and click "Open" to import it.
6.  The imported collection will appear in the left sidebar of the Postman interface.
7.  Expand the collection to view the available requests.
8.  Click on a request to open it and review its details, including the endpoint, request method, and any required headers or parameters.
9.  To execute a request, simply click on the "Send" button. The response will be displayed in the right panel, showing the status code, response body, and other relevant information.
10.  Repeat the above steps for other requests in the collection to test different API endpoints and functionalities.

Please note that before testing the APIs, ensure that the Node Auth Rest API server is running and accessible at the specified address (e.g., `http://localhost:4000`).

By using the provided Postman collections, you can easily explore and interact with the API endpoints to validate their behavior and verify the authentication flow.

Feel free to customize the requests or create new ones as needed to suit your specific testing requirements.

## Contributing

Contributions are welcome! If you find any issues or want to contribute to the project, feel free to open an issue or submit a pull request. Please make sure to follow the project's code style and guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](https://chat.openai.com/c/LICENSE) file for more details.

## Acknowledgements

-   [Express](https://expressjs.com/)
-   [Mongoose](https://mongoosejs.com/)
-   [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
-   [bcryptjs](https://www.npmjs.com/package/bcryptjs)
-   [Joi](https://joi.dev/)
-   [Helmet](https://helmetjs.github.io/)
-   [Cors](https://www.npmjs.com/package/cors)
