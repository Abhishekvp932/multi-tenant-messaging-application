import { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    text: string;
    senderId: Schema.Types.ObjectId;
    senderName: string;
    groupId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
