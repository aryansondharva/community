import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

// Socket authentication middleware
const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: any) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Invalid token or user not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

// Handle socket connections
export const initializeSocket = (io: Server) => {
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.user.fullName} (${socket.user.email})`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Handle joining project rooms
    socket.on('join-project', (projectId: string) => {
      socket.join(`project_${projectId}`);
      socket.to(`project_${projectId}`).emit('user-joined', {
        user: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Handle leaving project rooms
    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project_${projectId}`);
      socket.to(`project_${projectId}`).emit('user-left', {
        user: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Handle real-time project updates
    socket.on('project-update', (data) => {
      socket.to(`project_${data.projectId}`).emit('project-updated', {
        ...data,
        updatedBy: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Handle team collaboration
    socket.on('team-message', (data) => {
      const room = `team_${data.teamId}`;
      io.to(room).emit('new-message', {
        id: Date.now().toString(),
        message: data.message,
        sender: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`project_${data.projectId}`).emit('user-typing', {
        user: {
          id: socket.user._id,
          fullName: socket.user.fullName
        },
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`project_${data.projectId}`).emit('user-typing', {
        user: {
          id: socket.user._id,
          fullName: socket.user.fullName
        },
        isTyping: false
      });
    });

    // Handle real-time notifications
    socket.on('mark-notification-read', (notificationId: string) => {
      // This would typically update the database
      socket.emit('notification-marked-read', { notificationId });
    });

    // Handle event updates
    socket.on('join-event', (eventId: string) => {
      socket.join(`event_${eventId}`);
      socket.to(`event_${eventId}`).emit('participant-joined', {
        user: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Handle leaderboard updates
    socket.on('leaderboard-update', (data) => {
      io.emit('leaderboard-changed', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.fullName} (${socket.user.email})`);
      
      // Notify all rooms the user was in
      socket.rooms.forEach(room => {
        if (room !== socket.id && room.startsWith('project_')) {
          socket.to(room).emit('user-left', {
            user: {
              id: socket.user._id,
              fullName: socket.user.fullName,
              avatar: socket.user.avatar
            },
            timestamp: new Date()
          });
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.user.fullName}:`, error);
    });
  });

  console.log('🔌 Socket.IO server initialized');
};

// Helper function to send notifications to specific users
export const sendNotificationToUser = (io: Server, userId: string, notification: any) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date()
  });
};

// Helper function to broadcast to project room
export const broadcastToProject = (io: Server, projectId: string, event: string, data: any) => {
  io.to(`project_${projectId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

// Helper function to broadcast to team room
export const broadcastToTeam = (io: Server, teamId: string, event: string, data: any) => {
  io.to(`team_${teamId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

// Helper function to broadcast to event room
export const broadcastToEvent = (io: Server, eventId: string, event: string, data: any) => {
  io.to(`event_${eventId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};
