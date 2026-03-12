import { Router } from "express";
import { GroupController } from "../controller/group/group.controller";
import { GroupRepository } from "../repository/group/group.repository";
import { GroupService } from "../service/group/group.service";
import { UserRepository } from "../repository/user/user.repository";

const router = Router();
const userRepository = new UserRepository();
const groupRepository = new GroupRepository();
const groupService = new GroupService(groupRepository, userRepository);
const groupController = new GroupController(groupService);

router.route('/').post(groupController.create.bind(groupController));
router.route('/').get(groupController.getAll.bind(groupController));
router.route('/users').get(groupController.getUsersByRole.bind(groupController));
router.route('/member-groups').get(groupController.getGroupsByMember.bind(groupController));
router.route('/add-member').post(groupController.addMember.bind(groupController));

export default router;

