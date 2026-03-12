import { IAuthService } from "../../interface/auth/IAuthService";
import { IUserRepository } from "../../interface/user/IUserRepository";
import { PayloadUser } from "../../types/payloadUser";
import { ErrorMessage } from "../../utils/errorMessage";
import { comparePassword, hashPassword } from "../../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "../../utils/token";
export class AuthService implements IAuthService {
  constructor(private _userRepository: IUserRepository) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: PayloadUser }> {
    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new Error(ErrorMessage.USER_NOT_FOUND);
    }

    const isPassword = await comparePassword(password, user.password);

    if (!isPassword) {
      throw new Error(ErrorMessage.INCORRECT_PASSWORD);
    }

    const payload: TokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      organizationName: user.organizationName,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: payload,
    };
  }

  async signup(
    name: string,
    email: string,
    phone: string,
    password: string,
    role:string,organizationName:string
  ): Promise<{ msg: string }> {
    const existsUser = await this._userRepository.findByEmail(email);

    if (existsUser) {
      throw new Error(ErrorMessage.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      organizationName,
    };

    await this._userRepository.create(newUser);
    return { msg: "User Registration completed" };
  }
}
