import prisma from "../config/prisma.js";

export const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    return res.status(201).json({
      success: true,
      message: "Permissions fetched successfully",
      permissions,
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { resource, action } = req.body;
    if (!resource || !action) {
      return res.status(400).json({
        success: false,
        message: "Resource and action both are mandatory",
      });
    }

    const existingPerm = await prisma.permission.findFirst({
      where: { resource, action },
    });

    if (existingPerm) {
      return res.status(409).json({
        success: false,
        message: "Already such permission exists",
      });
    }

    const permission = await prisma.permission.create({
      data: { resource, action },
    });

    return res.status(201).json({
      permission,
      success: true,
      message: "Permission created successfully",
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};
