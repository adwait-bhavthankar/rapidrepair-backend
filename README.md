# RapidRepair Backend

RESTful API server for the RapidRepair application.

## Features

- User authentication with JWT
- MongoDB integration with Mongoose
- RESTful API endpoints
- CORS enabled
- Environment-based configuration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcryptjs

## Getting Started

```bash
cd rapidrepair-main/backend
npm install
npm run dev
```

The server runs on `http://localhost:5000`.

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |

## Project Structure

```
backend/
├── models/        # Mongoose models
├── routes/       # API routes
├── middleware/   # Custom middleware
├── server.js     # Entry point
└── .env          # Environment variables
```
