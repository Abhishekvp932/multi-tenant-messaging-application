import { Request, Response } from "express";
import { IGroupController } from "../../interface/group/IGroupController";
import { HttpStatus } from "../../utils/httpStatusCode";
import { IGroupService } from "../../interface/group/IGroupService";

export class GroupController implements IGroupController { 

    constructor (private _groupService:IGroupService){}

    async create(req: Request, res: Response): Promise<void> {
        try {
            const {name, createrId} = req.body;
            const result = await this._groupService.createGroup(name, createrId);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            const err = error  as Error;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({msg : err.message});
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const {createrId} = req.query;
            if (!createrId) {
                res.status(HttpStatus.BAD_REQUEST).json({msg: 'createrId is required'});
                return;
            }
            const groups = await this._groupService.getAllGroups(createrId as string);
            res.status(HttpStatus.OK).json(groups);
        } catch (error) {
            const err = error as Error;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({msg : err.message});
        }
    }

    async getUsersByRole(req: Request, res: Response): Promise<void> {
        try {
            const {role} = req.query;
            if (!role) {
                res.status(HttpStatus.BAD_REQUEST).json({msg: 'role is required'});
                return;
            }
            const users = await this._groupService.getUsersByRole(role as string);
            res.status(HttpStatus.OK).json(users);
        } catch (error) {
            const err = error as Error;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({msg : err.message});
        }
    }

    async addMember(req: Request, res: Response): Promise<void> {
        try {
            const {groupId, userId} = req.body;
            if (!groupId || !userId) {
                res.status(HttpStatus.BAD_REQUEST).json({msg: 'groupId and userId are required'});
                return;
            }
            const result = await this._groupService.addMemberToGroup(groupId, userId);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            const err = error as Error;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({msg : err.message});
        }
    }

    async getGroupsByMember(req: Request, res: Response): Promise<void> {
        try {
            const {memberId} = req.query;
            if (!memberId) {
                res.status(HttpStatus.BAD_REQUEST).json({msg: 'memberId is required'});
                return;
            }
            const groups = await this._groupService.getGroupsByMember(memberId as string);
            res.status(HttpStatus.OK).json(groups);
        } catch (error) {
            const err = error as Error;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({msg : err.message});
        }
    }
}