import { Socket } from 'socket.io';

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

export interface ISocket extends Socket {
  data: {
    user: {
      userId: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface TypingData {
  userId: string;
  userName: string;
  groupId: string;
}

export interface AddMemberToGroupData {
  groupId: string;
  userId: string;
}

export interface SendMessageData {
  groupId: string;
  text: string;
}
