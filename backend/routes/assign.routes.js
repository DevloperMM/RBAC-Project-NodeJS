import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/checkPermission.js";
import {
  assignRoleToUser,
  assignPermissionToRole,
} from "../controllers/assign.controller.js";

const router = Router();

router.post(
  "/role-to-user",
  authMiddleware,
  checkPermission("roles", "ASSIGN"),
  assignRoleToUser
);

router.post(
  "/permission-to-role",
  authMiddleware,
  checkPermission("permission", "ASSIGN"),
  assignPermissionToRole
);

export default router;
