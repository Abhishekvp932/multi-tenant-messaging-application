import { IGroupRepository } from "../../interface/group/IGroupRepositroy";
import Group from "../../models/implementation/group.model";
import { IGroup } from "../../models/interface/IGroup";
import { BaseRepository } from "../base.repository";

export class GroupRepository extends BaseRepository<IGroup> implements IGroupRepository {
    constructor (){
        super(Group);
    }

    async findByNameAndCreatedId(name : string,createdId: string): Promise<IGroup | null> {
        return await Group.findOne({name : name,createdBy:createdId});
    }

    async findByCreatedId(createdId: string): Promise<IGroup[]> {
        return await Group.find({createdBy: createdId}).populate('members', 'name email');
    }

    async findByMemberId(memberId: string): Promise<IGroup[]> {
        return await Group.find({members: memberId}).populate('members', 'name email');
    }

    async addMember(groupId: string, userId: string): Promise<IGroup | null> {
        return await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('members', 'name email');
    }
}