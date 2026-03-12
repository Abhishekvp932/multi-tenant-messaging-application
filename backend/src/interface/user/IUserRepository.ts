import { IUser } from "../../models/interface/IUser";

export interface IUserRepository {
    findByEmail(email:string):Promise<IUser | null>
    create(data:Partial<IUser>):Promise<IUser | null>;
   findById(patientId:string):Promise<IUser | null>;
   findByRole(role:string):Promise<IUser[]>;
}