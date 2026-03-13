import { Request, Response } from "express";

import { IAuthService } from "../../interface/auth/IAuthService";

import { IAuthController } from "../../interface/auth/IAuthController";

import { HttpStatus } from "../../utils/httpStatusCode";

export class AuthController implements IAuthController {
  constructor(private _authService: IAuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this._authService.login(email, password);
      
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false, // Disable secure for local development
        sameSite: "lax", // Use lax for local development
        maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE_TIME) * 1000,
        domain: undefined, // Let browser handle domain for localhost
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false, // Disable secure for local development
        sameSite: "lax", // Use lax for local development
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE_TIME) * 1000,
        domain: undefined, // Let browser handle domain for localhost
      });
      
      res.status(HttpStatus.OK).json(result.user);
    } catch (error) {
      const err = error as Error;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: err.message });
    }
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email,phone, password ,role,organizationName} = req.body;
      const result = await this._authService.signup(name, email,phone, password,role,organizationName);
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      const err = error as Error;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ msg: err.message });
    }
  }
}
