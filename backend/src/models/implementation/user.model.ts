import { IUser } from "../interface/IUser";
import mongoose from "mongoose";

const {Schema,model} = mongoose;


const userSchema = new Schema<IUser>({
    name:{
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type : String,
        required:true,
    },
    isBlocked:{
        type:Boolean,
        required:true,
        default:false,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
    },
    organizationName:{
        type:String,
    }

},{timestamps:true});

const User = model('User',userSchema);


export default User;