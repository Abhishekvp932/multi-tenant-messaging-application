import { Router } from "express";

import { UserRepository } from "../repository/user/user.repository";
import { AuthService } from "../service/auth/auth.service";
import { AuthController } from "../controller/auth/auth.controller";

const router = Router();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post("/login", authController.login.bind(authController));
router.post('/signup',authController.signup.bind(authController));
export default router;
