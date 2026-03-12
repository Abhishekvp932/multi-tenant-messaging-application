import mongoose ,{Document} from 'mongoose';

export interface IGroup extends Document {
    name: string;
    organization: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
