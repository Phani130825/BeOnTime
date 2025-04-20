# BeOnTime - Habit Tracking Application

BeOnTime is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for tracking and managing daily habits. It helps users build consistent habits by providing features like streak tracking, statistics, and progress visualization.

## Features

- User authentication (register, login, logout)
- Create, update, and delete habits
- Track daily habit completion
- Streak tracking
- Statistics and progress visualization
- Profile management
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/beontime.git
cd beontime
```

2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beontime
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

2. Start the frontend development server:

```bash
cd client
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Habits

- GET /api/habits - Get all habits
- POST /api/habits - Create a new habit
- GET /api/habits/:id - Get a single habit
- PATCH /api/habits/:id - Update a habit
- DELETE /api/habits/:id - Delete a habit
- POST /api/habits/:id/complete - Mark habit as completed
- GET /api/habits/:id/stats - Get habit statistics

### User Profile

- GET /api/users/profile - Get user profile
- PATCH /api/users/profile - Update user profile
- POST /api/users/change-password - Change password
- GET /api/users/stats - Get user statistics

## Technologies Used

- Frontend:

  - React.js
  - Material-UI
  - Chart.js
  - Axios
  - React Router

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication
  - bcryptjs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# BeOnTime
