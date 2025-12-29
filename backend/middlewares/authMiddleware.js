import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No valid token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await prisma.user.findUnique({
      where: { id: decodedToken?.userId },
      include: { roles: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Forgery found searching user" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
