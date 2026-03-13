import { ICreateGroupResponse, IGroupResponse, IUserResponse, IAddMemberResponse } from '../../types/group.types';

export interface IGroupService {
    createGroup(name:string,createrId:string):Promise<ICreateGroupResponse>;
    getAllGroups(createrId:string):Promise<IGroupResponse[]>;
    getGroupsByMember(memberId:string):Promise<IGroupResponse[]>;
    getUsersByRole(role:string):Promise<IUserResponse[]>;
    addMemberToGroup(groupId:string, userId:string):Promise<IAddMemberResponse>;
}