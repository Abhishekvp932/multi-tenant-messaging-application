import mongoose from 'mongoose';
import { IGroup } from '../interface/IGroup';

const { Schema, model } = mongoose;

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Group = model('Group', groupSchema);

export default Group;
