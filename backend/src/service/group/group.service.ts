import mongoose from "mongoose";
import { IGroupRepository } from "../../interface/group/IGroupRepositroy";
import { IGroupService } from "../../interface/group/IGroupService";
import { IUserRepository } from "../../interface/user/IUserRepository";
import { ErrorMessage } from "../../utils/errorMessage";
import { ICreateGroupResponse, IGroupResponse, IUserResponse, IAddMemberResponse } from "../../types/group.types";

export class GroupService implements IGroupService {
    constructor(private _groupRepository: IGroupRepository, private _userRepository: IUserRepository) { }

    async createGroup(name: string, createrId: string): Promise<ICreateGroupResponse> {

        const user = await this._userRepository.findById(createrId);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        };

        const existsGroup = await this._groupRepository.findByNameAndCreatedId(name, createrId);

        if (existsGroup) {
            throw new Error('Group Already Exists');
        };

        const newGroup = {
            name: name,
            createdBy: new mongoose.Types.ObjectId(createrId),
            organization: new mongoose.Types.ObjectId(createrId),

        }



        const createdGroup = await this._groupRepository.create(newGroup);
        if (!createdGroup) {
            throw new Error('Failed to create group');
        }
        return { 
            msg: 'New Group Created successfully',
            group: {
                _id: createdGroup._id.toString(),
                name: createdGroup.name,
                memberCount: createdGroup.members.length,
                createdAt: createdGroup.createdAt
            }
        };
    }

    async getAllGroups(createrId: string): Promise<IGroupResponse[]> {
        const groups = await this._groupRepository.findByCreatedId(createrId);
        return groups.map(group => ({
            _id: group._id.toString(),
            name: group.name,
            memberCount: group.members.length,
            createdAt: group.createdAt
        }));
    }

    async getGroupsByMember(memberId: string): Promise<IGroupResponse[]> {
        const groups = await this._groupRepository.findByMemberId(memberId);
        return groups.map(group => ({
            _id: group._id.toString(),
            name: group.name,
            memberCount: group.members.length,
            createdAt: group.createdAt
        }));
    }

    async getUsersByRole(role: string): Promise<IUserResponse[]> {
        const users = await this._userRepository.findByRole(role);
        return users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        }));
    }

    async addMemberToGroup(groupId: string, userId: string): Promise<IAddMemberResponse> {
        const group = await this._groupRepository.addMember(groupId, userId);
        if (!group) {
            throw new Error('Group not found or user already added');
        }
        return {
            msg: 'Member added successfully',
            group: {
                _id: group._id.toString(),
                name: group.name,
                memberCount: group.members.length,
                createdAt: group.createdAt
            }
        };
    }
}