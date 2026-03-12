import { Request } from "express";
import { TokenPayload } from "../utils/token";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}