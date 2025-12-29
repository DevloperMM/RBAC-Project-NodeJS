import { Router } from "express";
import { checkPermission } from "../middlewares/checkPermission.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createPermission,
  getPermissions,
} from "../controllers/permission.controller.js";

const router = Router();

router
  .route("/")
  .get(authMiddleware, checkPermission("permissions", "READ"), getPermissions)
  .post(
    authMiddleware,
    checkPermission("permissions", "CREATE"),
    createPermission
  );

export default router;
