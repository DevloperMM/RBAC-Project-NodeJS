import { Router } from "express";
import {
  getProfile,
  loginController,
  registerController,
  updateProfile,
} from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);

router
  .route("/profile")
  .get(authMiddleware, getProfile)
  .patch(authMiddleware, updateProfile);

export default router;
