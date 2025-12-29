import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/checkPermission.js";
import {
  createRole,
  deleteRole,
  viewRole,
} from "../controllers/role.controller.js";

const router = Router();

router.get("/view", authMiddleware, checkPermission("roles", "READ"), viewRole);

router.post(
  "/create",
  authMiddleware,
  checkPermission("roles", "CREATE"),
  createRole
);

router.delete(
  "/delete/:id",
  authMiddleware,
  checkPermission("roles", "DELETE"),
  deleteRole
);

export default router;
