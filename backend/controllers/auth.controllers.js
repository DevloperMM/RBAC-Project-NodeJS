import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    const { id, name, email, roles } = req.user;
    return res.status(201).json({
      success: true,
      user: { id, name, email, roles: roles.map((r) => r.name) },
    });
  } catch (error) {
    return res
      .status(error?.status || 500)
      .json({ success: false, message: "Error getting your profile details" });
  }
};

export const updateProfile = async (req, res) => {
  const id = req.user.id;
  const { name, email, password } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing changed",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated !!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRY,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
};

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!defaultRole) {
      return res
        .status(500)
        .json({ success: false, message: "Default role not found in DB" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: { connect: { id: defaultRole.id } },
      },
      include: { roles: true },
    });

    return res.status(201).json({
      success: true,
      message: "User registered !!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
};
