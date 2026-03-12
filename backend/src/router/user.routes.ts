import {Router} from 'express';
import { UserController } from '../controller/user/user.controller';
import { UserService } from '../service/user/user.service';
import { UserRepository } from '../repository/user/user.repository';
const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


router.route('/').get(userController.logout.bind(userController));


export default router;