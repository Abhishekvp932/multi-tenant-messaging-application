import { IUserService } from "../../interface/user/IUserService";
import { IUserRepository } from "../../interface/user/IUserRepository";
export class UserService implements IUserService {
    constructor(
        private _userRepository :IUserRepository
    ){}
}