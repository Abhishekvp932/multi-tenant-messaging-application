# 🚀 Real-Time Chat Application

A professional, full-stack real-time chat application built with modern web technologies. Features group management, real-time messaging, and user administration.

## ✨ Features

### 🎯 Core Features
- **Real-time Messaging** - Instant message delivery using Socket.io
- **Group Management** - Create and manage chat groups
- **User Roles** - Admin and user role-based access
- **Database Persistence** - All messages stored in MongoDB
- **Live Updates** - Real-time group additions without page refresh

### 🛠️ Technical Features
- **TypeScript** - Full type safety across the application
- **Responsive Design** - Mobile-friendly interface
- **Authentication** - Secure cookie-based authentication
- **Error Handling** - Comprehensive error management
- **Professional UI** - Modern, intuitive interface

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Socket.io-client** for real-time communication
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Toastify** for notifications

### Backend (Node.js + Express)
- **Express.js** REST API
- **Socket.io** for real-time events
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cookie-based sessions**
- **TypeScript** for type safety

### Database (MongoDB)
- **Users Collection** - User authentication and profiles
- **Groups Collection** - Chat group management
- **Messages Collection** - Message history and persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chatapp
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
```

4. **Environment Setup**

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

5. **Start the application**

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 📱 Usage

### Admin Features
1. **Login as Admin** - Access admin dashboard
2. **Create Groups** - Create new chat groups
3. **Add Members** - Add users to groups in real-time
4. **Manage Groups** - View all groups and member counts
5. **Real-time Chat** - Participate in group conversations

### User Features
1. **Login as User** - Access user dashboard
2. **View Groups** - See groups you're a member of
3. **Real-time Updates** - Get instant notifications for new groups
4. **Group Chat** - Participate in conversations
5. **Message History** - View past messages when joining groups

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Groups
- `GET /api/groups` - Get all groups (admin)
- `GET /api/groups/member/:userId` - Get user's groups
- `POST /api/groups` - Create new group
- `POST /api/groups/:groupId/members` - Add member to group
- `GET /api/users/role/:role` - Get users by role

### Socket.io Events
- `connection` - User connects to socket
- `join_group` - Join a group room
- `leave_group` - Leave a group room
- `send_message` - Send a message
- `new_message` - Receive a message
- `add_member_to_group` - Add member (real-time)
- `added_to_group` - User added to group notification
- `member_added_success` - Admin confirmation
- `typing_start` - User starts typing
- `typing_stop` - User stops typing

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'admin' | 'user'
  organization: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Group Schema
```javascript
{
  _id: ObjectId,
  name: String,
  createdBy: ObjectId, // Admin who created it
  members: [ObjectId], // Array of user IDs
  organization: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  text: String,
  senderId: ObjectId,
  senderName: String,
  groupId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Components

### Admin Dashboard
- **Group Management** - Create, view, and manage groups
- **Member Management** - Add users to groups
- **Chat Interface** - Real-time messaging
- **User List** - View all organization members

### User Dashboard
- **Group List** - Show groups user belongs to
- **Chat Interface** - Real-time messaging
- **Profile Card** - User information display
- **Real-time Notifications** - Group addition alerts

## 🔒 Security Features

- **Password Hashing** - bcrypt for secure password storage
- **JWT Authentication** - Secure token-based auth
- **Cookie Security** - HttpOnly, Secure cookies
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin resource sharing
- **Socket Authentication** - Secure socket connections

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://your-atlas-cluster/chatapp
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend deployment
cd backend
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

#### Socket Connection Issues
- Ensure backend is running on port 4000
- Check CORS settings in socket configuration
- Verify frontend is running on port 5173

#### Database Connection
- Verify MongoDB is running
- Check connection string in .env file
- Ensure proper network access to MongoDB

#### Authentication Issues
- Clear browser cookies and cache
- Verify JWT_SECRET is set
- Check cookie settings in browser

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=socket.io:*
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🎯 Future Enhancements

- [ ] File sharing capabilities
- [ ] Voice/video calling
- [ ] Message reactions
- [ ] User status indicators
- [ ] Group permissions
- [ ] Message search
- [ ] Mobile app
- [ ] Push notifications
- [ ] End-to-end encryption
- [ ] Message threading

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) - Real-time communication
- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**Built with ❤️ using modern web technologies**
