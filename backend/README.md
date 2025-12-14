# TripMate Backend API

Express.js REST API for TripMate travel app with MongoDB and JWT authentication.

## Features

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ MongoDB database
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `JWT_SECRET` - Change to a secure random string
- `MONGODB_URI` - Your MongoDB connection string

### 3. Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 4. Run Server

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6584f3a2b1c2d3e4f5a6b7c8",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://i.pravatar.cc/150",
    "bio": "",
    "location": "",
    "stats": {
      "trips": 0,
      "followers": 0,
      "following": 0
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6584f3a2b1c2d3e4f5a6b7c8",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://i.pravatar.cc/150",
    "bio": "",
    "location": "",
    "stats": {
      "trips": 0,
      "followers": 0,
      "following": 0
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "6584f3a2b1c2d3e4f5a6b7c8",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://i.pravatar.cc/150",
    "bio": "Travel enthusiast",
    "location": "New York, USA",
    "stats": {
      "trips": 5,
      "followers": 120,
      "following": 85
    },
    "createdAt": "2024-12-14T10:30:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "bio": "World traveler",
  "location": "Los Angeles, CA"
}
```

### Users

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "TripMate API is running"
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Auth logic
│   └── userController.js  # User logic
├── middleware/
│   └── auth.js           # JWT verification
├── models/
│   └── User.js           # User model
├── routes/
│   ├── auth.js           # Auth routes
│   └── users.js          # User routes
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
├── README.md            # Documentation
└── server.js            # Entry point
```

## Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Profile:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/tripmate |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `NODE_ENV` | Environment mode | development |

## Security Notes

- Never commit `.env` file to version control
- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Implement rate limiting for production
- Add input sanitization for production

## Next Steps

1. Add password reset functionality
2. Add email verification
3. Add refresh tokens
4. Add social OAuth (Google)
5. Add trip/post endpoints
6. Add image upload functionality
7. Add search and filters
8. Add notifications system

## License

MIT
