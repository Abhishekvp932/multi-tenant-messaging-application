export interface IGroupService {
    createGroup(name:string,createrId:string):Promise<{msg : string, group?: any}>;
    getAllGroups(createrId:string):Promise<any[]>;
    getGroupsByMember(memberId:string):Promise<any[]>;
    getUsersByRole(role:string):Promise<any[]>;
    addMemberToGroup(groupId:string, userId:string):Promise<any>;
}