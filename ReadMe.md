# YouTube Clone Backend API

A full-stack web application backend that replicates core YouTube functionality with user authentication, video management, and cloud storage integration.

## 🚀 Features

### User Management

- **User Registration & Authentication**: Complete signup/login system with JWT tokens
- **Profile Management**: Update user details, avatar, and cover images
- **Password Management**: Secure password hashing and change functionality
- **Session Management**: Refresh token mechanism for secure authentication

### Video Management

- **Video Upload**: Upload videos with thumbnails to Cloudinary
- **Video Metadata**: Title, description, duration, and view tracking
- **Video Privacy**: Published/unpublished video states
- **Watch History**: Track user's viewing history

### File Management

- **Cloud Storage**: Integrated with Cloudinary for media storage
- **Image Processing**: Automatic avatar and cover image optimization
- **File Validation**: Secure file upload with validation

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Cloud Services

- **Cloudinary** - Media storage and optimization

### Middleware & Utilities

- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing
- **Mongoose Aggregate Paginate** - Pagination support

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [Cloudinary Account](https://cloudinary.com/) for media storage

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/youtube-clone
   CORS_ORIGIN=http://localhost:3000
   ACCESS_TOKEN_SECRET=your-access-token-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000` (or your specified PORT).

## 📁 Project Structure

```
src/
├── controllers/         # Route handlers
│   └── user.controller.js
├── models/             # Database schemas
│   ├── user.model.js
│   ├── video.model.js
│   └── subscriptions.model.js
├── routes/             # API routes
│   └── user.routes.js
├── middlewares/        # Custom middleware
│   ├── auth.middleware.js
│   └── multer.middleware.js
├── utils/              # Utility functions
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
├── db/                 # Database connection
│   └── index.js
├── app.js              # Express app configuration
└── index.js            # Server entry point
```

## 🌐 API Endpoints

### Authentication

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### User Management

- `GET /api/v1/users/current-user` - Get current user details
- `POST /api/v1/users/change-password` - Change user password
- `PATCH /api/v1/users/update-account` - Update user details
- `PATCH /api/v1/users/avatar` - Update user avatar
- `PATCH /api/v1/users/cover-image` - Update user cover image

## 🔐 Authentication Flow

1. **Registration**: User creates account with username, email, and password
2. **Login**: User receives JWT access token and refresh token
3. **Token Storage**: Tokens stored in HTTP-only cookies
4. **Protected Routes**: Access token validates user requests
5. **Token Refresh**: Automatic token refresh using refresh token

## 📊 Database Models

![DB Model](/public/image/1751908336806.png)

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- File upload size limited to 16kb for form data
- Error handling could be more granular
- Missing video management endpoints

## 🔮 Future Enhancements

- [ ] Video upload and management endpoints
- [ ] Comment system
- [ ] Like/dislike functionality
- [ ] Subscription management
- [ ] Search functionality
- [ ] Video recommendations
- [ ] User playlists
- [ ] Admin dashboard

## 🎓 Credits

This project was built following the excellent **"Chai aur Backend"** series by [Hitesh Chaudhary](https://github.com/hiteshchoudhary). The series provides comprehensive coverage of backend development with Node.js, Express, and MongoDB.

- **Instructor**: Hitesh Chaudhary
- **Course**: Chai aur Backend Series
- **Platform**: YouTube - [Chai aur Code](https://www.youtube.com/@chaiaurcode)
- **GitHub**: [hiteshchoudhary](https://github.com/hiteshchoudhary)
