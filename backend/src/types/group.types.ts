import { Document, Types } from 'mongoose';

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
  organization: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupResponse {
  _id: string;
  name: string;
  memberCount: number;
  createdAt: Date;
}

export interface ICreateGroupResponse {
  msg: string;
  group?: IGroupResponse;
}

export interface IAddMemberResponse {
  msg: string;
  group: IGroupResponse;
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface ISocketError {
  message: string;
}

export interface IAddedToGroupData {
  groupId: string;
  groupName: string;
  memberCount: number;
}

export interface IMemberAddedSuccessData {
  groupId: string;
  memberCount: number;
}
