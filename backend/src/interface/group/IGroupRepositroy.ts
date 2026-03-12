import { IGroup } from "../../models/interface/IGroup";

export interface IGroupRepository {
    create(data:Partial<IGroup>):Promise<IGroup | null>;
    findByNameAndCreatedId(name:string,createdId:string):Promise<IGroup | null>;
    findByCreatedId(createdId:string):Promise<IGroup[]>;
    findByMemberId(memberId:string):Promise<IGroup[]>;
    addMember(groupId:string, userId:string):Promise<IGroup | null>;
}