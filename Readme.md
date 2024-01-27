# YouTube + Twitter Backend

This project provides the backend functionality for a web application that combines features of YouTube and Twitter.

## Table of Contents
- [Project Structure](#project-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

The project follows a well-organized structure:

- **controllers**: Houses controllers for various functionalities, promoting modular and maintainable code.
  - `user.controller.js`
  - `video.controller.js`
  - `comment.controller.js`
  - `like.controller.js`
  - `subscription.controller.js`
  - `playlist.controller.js`
  - `dashboard.controller.js`
  - `tweet.controller.js`

- **middlewares**: Contains essential middleware functions.
  - `auth.middleware.js`: Handles user authentication.
  - `multer.middleware.js`: Manages file uploads using Multer.

- **db**: Configurations related to the MongoDB database.

- **models**: MongoDB models defining the data structure.
  - `video.model.js`
  - `user.model.js`
  - `comment.model.js`
  - `tweet.model.js`
  - `subscription.model.js`
  - `like.model.js`
  - `playlist.model.js`

- **routes**: Defines routes for all controllers, ensuring clean separation of concerns.

- **utils**: Hosts utility functions for common tasks.

```
|-- controllers
|   |-- user.controller.js
|   |-- video.controller.js
|   |-- comment.controller.js
|   |-- like.controller.js
|   |-- subscription.controller.js
|   |-- playlist.controller.js
|   |-- dashboard.controller.js
|   |-- tweet.controller.js
|-- middlewares
|   |-- auth.middleware.js
|   |-- multer.middleware.js
|-- db
|   |-- [Database Configuration Files]
|-- models
|   |-- video.model.js
|   |-- user.model.js
|   |-- comment.model.js
|   |-- tweet.model.js
|   |-- subscription.model.js
|   |-- like.model.js
|   |-- playlist.model.js
|-- routes
|   |-- [Route Files]
|-- utils
|   |-- [Utility Files]
```


## Features

- User authentication and authorization
- Video and tweet management (upload, view, like, comment, share)
- Subscriptions to other users
- Playlist creation and management
- User dashboard
- File uploads using Multer
- Cloudinary integration for file storage
- Secure authentication with JWT
- Environment variable management with Dotenv
- Cross-Origin Resource Sharing (CORS) support
- Cookie parsing
- Password encryption with Bcrypt
  
## Technologies Used

- Database: MongoDB with Mongoose for seamless object modeling.
- Server: Node.js powered by the Express framework for a fast and minimalistic web framework.
- File Storage: Cloudinary for efficient storage and retrieval of files and images.
- Authentication: JSON Web Tokens (JWT) for secure user authentication.
- Environment Variables: Dotenv
- Middleware: cors for enabling cross-origin resource sharing, cookie-parser for parsing cookies, and bcrypt for password hashing.

## Getting Started

1. Clone the repository:
```
git clone https://github.com/PrtHub/backend-project.git
```
3. Install dependencies:
```
npm instal
```
3. Create a `.env` file and set up the required environment variables (database connection string, Cloudinary credentials, etc.).
   
4. Start the server:
```
npm start
```

## Usage

Document how to interact with the backend API. Include sample requests and responses, authentication procedures, file upload instructions, and other key features.

## Contributing

I welcome contributions! Please follow these guidelines:

- Fork the repository and create a branch for your changes.
- Make your changes and commit them with clear messages.
- Push your changes to your fork and create a pull request.
- I'll review your changes and merge them if they meet my guidelines.

## License

This project is licensed under the [Pritam Ghosh] - see the [LICENSE.md] file for details.
