import { Response, NextFunction } from "express";
import { HttpStatus } from "../utils/httpStatusCode";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token";
import { AuthRequest } from "../types/authRequest";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ msg: "NOT_AUTHENTICATED" });
  }

  if (accessToken) {
    const decodedAccess = verifyAccessToken(accessToken);
    if (decodedAccess) {
      req.user = decodedAccess;
      return next();
    }
  }

  if (!refreshToken) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ msg: "NO_REFRESH_TOKEN" });
  }

  const decodedRefresh = verifyRefreshToken(refreshToken);

  if (!decodedRefresh) {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ msg: "INVALID_REFRESH_TOKEN" });
  }

  const newAccessToken = generateAccessToken({
    _id: decodedRefresh._id,
    email: decodedRefresh.email,
    name: decodedRefresh.name,
    role: decodedRefresh.role,
  });

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: false, // Disable secure for local development
    sameSite: "lax", // Use lax for local development
    maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE_TIME) * 1000,
    domain: undefined, // Let browser handle domain for localhost
  });

  req.user = decodedRefresh;
  next();
};
