import { Document } from "mongoose";

export interface IUser extends Document{
    name : string;
    email:string;
    phone:string;
    role:string,
    organizationName?:string;
    password:string;
    isBlocked:Boolean;
    createdAt : Date;
    updatedAt : Date;
}