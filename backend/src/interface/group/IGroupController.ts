import { Request, Response } from "express";

export interface IGroupController {
    create(req:Request,res:Response):Promise<void>;
    getAll(req:Request,res:Response):Promise<void>;
    getUsersByRole(req:Request,res:Response):Promise<void>;
    addMember(req:Request,res:Response):Promise<void>;
    getGroupsByMember(req:Request,res:Response):Promise<void>;
}