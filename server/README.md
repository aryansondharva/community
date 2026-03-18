# HackHub Server API

A comprehensive backend API for the HackHub platform, providing authentication, file uploads, real-time updates, search functionality, and email notifications.

## Features

### 🔐 Authentication System
- **JWT-based authentication** with secure token generation
- **Email verification** for account activation
- **Password reset** functionality with email notifications
- **Role-based access control** (admin, user roles)
- **Secure password hashing** with bcrypt

### 📧 Email Notifications
- **Welcome emails** for new users
- **Email verification** notifications
- **Password reset** emails
- **Notification system** with email integration
- **HTML email templates** with professional design

### 📁 File Upload System
- **Multi-file upload** support (up to 5 files)
- **Single file upload** with validation
- **Avatar upload** specifically for profile pictures
- **File type validation** (images, documents, videos, audio)
- **User-specific directories** for organization
- **File management** (list, delete operations)

### ⚡ Real-time Updates
- **Socket.IO integration** for live updates
- **Project collaboration** features
- **Team messaging** system
- **Typing indicators**
- **Live notifications**
- **Event broadcasting**

### 🔍 Search & Filtering
- **Global search** across users, projects, events, teams
- **Advanced filtering** by role, skills, status, location
- **Search suggestions** and autocomplete
- **Trending search terms**
- **Pagination** support
- **Text indexing** for fast searches

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /me` - Get current user info
- `POST /logout` - User logout

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PATCH /profile` - Update profile
- `GET /:id` - Get public user profile
- `PATCH /avatar` - Update avatar
- `PATCH /change-password` - Change password
- `DELETE /account` - Delete account

### Projects (`/api/projects`)
- `GET /` - List projects with filters
- `GET /:id` - Get project details
- `POST /` - Create new project
- `PATCH /:id` - Update project
- `DELETE /:id` - Delete project
- `POST /:id/like` - Like/unlike project
- `POST /:id/join` - Join project team
- `POST /:id/leave` - Leave project team

### Events (`/api/events`)
- `GET /` - List events
- `GET /:id` - Get event details
- `POST /:id/register` - Register for event
- `DELETE /:id/register` - Cancel registration
- `GET /:id/participants` - Get event participants

### Teams (`/api/teams`)
- `GET /` - List teams
- `GET /:id` - Get team details
- `POST /` - Create team
- `PATCH /:id` - Update team
- `DELETE /:id` - Delete team
- `POST /:id/join` - Request to join team
- `POST /:id/leave` - Leave team

### File Upload (`/api/upload`)
- `POST /single` - Upload single file
- `POST /multiple` - Upload multiple files
- `POST /avatar` - Upload avatar
- `DELETE /:filename` - Delete file
- `GET /my-files` - List user files

### Search (`/api/search`)
- `GET /` - Global search
- `GET /users` - Search users
- `GET /suggestions` - Get search suggestions
- `POST /advanced` - Advanced search
- `GET /trending` - Get trending terms

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `PATCH /:id/read` - Mark as read
- `PATCH /read-all` - Mark all as read
- `DELETE /:id` - Delete notification
- `GET /preferences` - Get notification preferences
- `PATCH /preferences` - Update preferences

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Socket.IO** - Real-time communication
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Zod** - Schema validation
- **Bcrypt** - Password hashing

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hackhub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@hackhub.dev
FROM_NAME=HackHub

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see above)

4. Start MongoDB server

5. Run the development server:
   ```bash
   npm run dev
   ```

6. For production:
   ```bash
   npm run build
   npm start
   ```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Socket.IO Events

### Client to Server
- `join-project` - Join project room
- `leave-project` - Leave project room
- `project-update` - Send project updates
- `team-message` - Send team message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `join-event` - Join event room

### Server to Client
- `notification` - New notification
- `project-updated` - Project updated
- `user-joined` - User joined project
- `user-left` - User left project
- `new-message` - New team message
- `user-typing` - User typing indicator
- `leaderboard-changed` - Leaderboard updated

## Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT token** authentication
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **Input validation** with Zod schemas
- **File upload validation** and sanitization
- **Helmet.js** for security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
