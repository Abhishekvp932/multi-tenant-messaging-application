
// eslint-disable-next-line no-unused-vars
import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  _id: string;
  text: string;
  senderId: string;
  senderName: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  groupId: string;
}

class SocketService {
  private socket: Socket | null = null;
  // eslint-disable-next-line
  private token: string | null = null;
  
  connect(userId: string, userName: string) {
    console.log(this.token);
    this.socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      query: {
        userId,
        userName
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  joinGroup(groupId: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('join_group', groupId);
  }

  leaveGroup(groupId: string) {
    if (!this.socket) return;
    this.socket.emit('leave_group', groupId);
  }

  sendMessage(groupId: string, text: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('send_message', { groupId, text });
  }

  addMemberToGroup(groupId: string, userId: string) {
    if (!this.socket) return;
    this.socket.emit('add_member_to_group', { groupId, userId });
  }

  onAddedToGroup(callback: (data: { groupId: string; groupName: string; memberCount: number }) => void) {
    if (!this.socket) return;
    this.socket.on('added_to_group', callback);
  }

  onMemberAddedSuccess(callback: (data: { groupId: string; memberCount: number }) => void) {
    if (!this.socket) return;
    this.socket.on('member_added_success', callback);
  }

  startTyping(groupId: string) {
    if (!this.socket) return;
    this.socket.emit('typing_start', groupId);
  }

  stopTyping(groupId: string) {
    if (!this.socket) return;
    this.socket.emit('typing_stop', groupId);
  }

  onNewMessage(callback: (message: SocketMessage) => void) {
    if (!this.socket) return;
    this.socket.on('new_message', callback);
  }

  onGroupMessages(callback: (messages: SocketMessage[]) => void) {
    if (!this.socket) return;
    this.socket.on('group_messages', callback);
  }

  onUserTyping(callback: (typingUser: TypingUser) => void) {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  onUserStopTyping(callback: (typingUser: TypingUser) => void) {
    if (!this.socket) return;
    this.socket.on('user_stop_typing', callback);
  }

  onError(callback: (error: { message: string }) => void) {
    if (!this.socket) return;
    this.socket.on('error', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
