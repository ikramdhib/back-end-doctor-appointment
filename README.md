# Doctor Appointment Backend

This is the backend API for the Doctor Appointment Management System, built with Node.js, Express, and MongoDB. The API handles authentication, doctor availability management, appointment scheduling, and notification services.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Contact](#contact)

## Features

- **User Authentication**: Secure login and registration for doctors and patients.
- **Doctor Management**: CRUD operations for doctors, including availability scheduling.
- **Appointment Management**: Patients can book, update, and cancel appointments with doctors.
- **Notification System**: Real-time notifications for appointment status updates.
- **API Security**: Implemented with JWT-based authentication.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: For securing API endpoints.
- **Socket.IO**: Real-time bidirectional event-based communication for notifications.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18.x or higher)
- **MongoDB** (local or cloud instance)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ikramdhib/doctor-appointment-backend.git
   
2. Install dependencies:

   ```bash
   npm install
## Environment Variables

Create a ".env" file in the root directory and add the following environment variables:
 
       PORT=3000
      MONGO_URI=mongodb://localhost:27017/doctor-appointment
      JWT_SECRET=your_jwt_secret

- PORT: The port number on which the server will run.
- MONGO_URI: The connection string for your MongoDB database.
- JWT_SECRET: A secret key for signing JWT tokens.

## Running the Server 
   
     npm start
     
## Running the Server 

    .
    ├── src/
    │   ├── controllers/   # Controller functions to handle API requests
    │   ├── models/        # Mongoose models for MongoDB
    │   ├── routes/        # Express routes for different API endpoints
    │   ├── middleware/    # Custom middleware for authentication and error handling
    │   ├── utils/         # Utility functions and helpers
    │   ├── app.js         # Main application file
    ├── .env               # Environment variables
    ├── package.json       # Node.js dependencies and scripts
    ├── README.md          # Documentation

    
## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any features, fixes, or improvements.

## Contact

For any inquiries or support, feel free to contact me:

**Ikram Dhib**  
- Email: [dhibikram50@gmail.com]
- LinkedIn: [https://www.linkedin.com/in/dhib-ikram-3190051ab/]
- GitHub: [https://github.com/ikramdhib]
