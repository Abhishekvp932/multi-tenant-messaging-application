import { Schema, model, Types } from "mongoose";
import { IMessage } from "../interface/IMessage";

const messageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true,
      trim: true
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient querying
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export const Message = model<IMessage>('Message', messageSchema);
