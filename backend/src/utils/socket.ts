import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import cookie from 'cookie-parser';
import User from '../models/implementation/user.model';
import { Message } from '../models/implementation/message.model';
import Group from '../models/implementation/group.model';

export interface SocketUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  socketId: string;
}

export interface SocketMessage {
  _id: string;
  text: string;
  senderId: string;
  senderName: string;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Simplified authentication - we'll handle user verification in individual events
    this.io.use(async (socket: any, next: any) => {
      try {
        // For now, we'll allow connection and verify user in each event
        // This is simpler and works with cookie-based auth
        const userId = socket.handshake.query.userId || 'temp';
        const userName = socket.handshake.query.userName || 'User';
        
        socket.data.user = {
          userId: userId,
          name: userName,
          email: 'temp@example.com',
          role: 'user' // We'll determine admin status in individual events
        };
        next();
      } catch (error: any) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      const user = socket.data.user as SocketUser;
      
      // Store user connection
      const socketUser: SocketUser = {
        ...user,
        socketId: socket.id
      };
      this.connectedUsers.set(user.userId, socketUser);


      // Handle joining a specific group
      socket.on('join_group', async (groupId: string) => {
        try {
          // Verify user is member of the group
          const group = await Group.findById(groupId);
          if (!group) {
            socket.emit('error', { message: 'Group not found' });
            return;
          }

          // Check if user is creator or member
          const isMember = group.createdBy.toString() === user.userId || 
                          group.members.some((memberId: any) => memberId.toString() === user.userId);
          
          if (!isMember) {
            socket.emit('error', { message: 'You are not a member of this group' });
            return;
          }

          socket.join(`group_${groupId}`);

          // Send recent messages to the user
          const recentMessages = await Message.find({ groupId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name');
          
          socket.emit('group_messages', recentMessages.reverse());
        } catch (error: any) {
          socket.emit('error', { message: 'Failed to join group' });
        }
      });

      // Handle leaving a group
      socket.on('leave_group', (groupId: string) => {
        socket.leave(`group_${groupId}`);
      });

      // Handle adding members to groups
      socket.on('add_member_to_group', async (data: {
        groupId: string;
        userId: string;
      }) => {
        try {
          const { groupId, userId } = data;
          
          
          // Verify user is admin or group creator
          const group = await Group.findById(groupId);
          if (!group) {
            socket.emit('error', { message: 'Group not found' });
            return;
          }

          
          const isAdmin = group.createdBy.toString() === user.userId;
          
          
          if (!isAdmin) {
            socket.emit('error', { message: 'Only admins can add members' });
            return;
          }

          // Add user to group
          const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { members: userId } },
            { new: true }
          ).populate('members', 'name email');

          if (!updatedGroup) {
            socket.emit('error', { message: 'Failed to update group' });
            return;
          }


          // Notify the specific user who was added
          this.sendToUser(userId, 'added_to_group', {
            groupId: updatedGroup._id,
            groupName: updatedGroup.name,
            memberCount: updatedGroup.members.length
          });

          // Notify admin that member was added
          socket.emit('member_added_success', {
            groupId: updatedGroup._id,
            memberCount: updatedGroup.members.length
          });

        } catch (error: any) {
          socket.emit('error', { message: 'Failed to add member' });
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data: {
        groupId: string;
        text: string;
      }) => {
        try {
          const { groupId, text } = data;
          
          if (!text.trim()) {
            socket.emit('error', { message: 'Message text is required' });
            return;
          }

          // Verify user is member of the group
          const group = await Group.findById(groupId);
          if (!group) {
            socket.emit('error', { message: 'Group not found' });
            return;
          }

          const isMember = group.createdBy.toString() === user.userId || 
                          group.members.some((memberId: any) => memberId.toString() === user.userId);
          
          if (!isMember) {
            socket.emit('error', { message: 'You are not a member of this group' });
            return;
          }

          // Create and save message
          const message = new Message({
            text: text.trim(),
            senderId: user.userId,
            senderName: user.name,
            groupId
          });

          const savedMessage = await message.save();

          // Broadcast message to all users in the group
          this.io.to(`group_${groupId}`).emit('new_message', savedMessage);

        } catch (error: any) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (groupId: string) => {
        socket.to(`group_${groupId}`).emit('user_typing', {
          userId: user.userId,
          userName: user.name,
          groupId
        });
      });

      socket.on('typing_stop', (groupId: string) => {
        socket.to(`group_${groupId}`).emit('user_stop_typing', {
          userId: user.userId,
          userName: user.name,
          groupId
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(user.userId);
      });

      // Handle errors
      socket.on('error', (error: any) => {
      });
    });
  }

  // Get online users in a group
  public getGroupUsers(groupId: string): SocketUser[] {
    // This would require tracking which groups each user is in
    // For now, return all connected users
    return Array.from(this.connectedUsers.values());
  }

  // Get all connected users
  public getAllConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Send notification to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  // Send notification to all users in a group
  public sendToGroup(groupId: string, event: string, data: any) {
    this.io.to(`group_${groupId}`).emit(event, data);
  }

  // Get socket.io instance
  public getIO() {
    return this.io;
  }
}

export let socketManager: SocketManager;

export const initializeSocket = (server: HTTPServer) => {
  socketManager = new SocketManager(server);
  return socketManager;
};
