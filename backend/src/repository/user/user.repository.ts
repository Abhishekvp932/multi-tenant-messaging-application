import { IUserRepository } from "../../interface/user/IUserRepository";
import User from "../../models/implementation/user.model";
import { IUser } from "../../models/interface/IUser";
import { BaseRepository } from "../base.repository";


export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor(){
        super(User);
    }
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({email});
    }

    async findByRole(role: string): Promise<IUser[]> {
        return await User.find({role: role}).select('name email role');
    }
    
}