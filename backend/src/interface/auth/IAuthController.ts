import { Request,Response } from "express";

export interface IAuthController { 
    login(req:Request,res:Response):Promise<void>;
    signup(req:Request,res:Response):Promise<void>;
}
