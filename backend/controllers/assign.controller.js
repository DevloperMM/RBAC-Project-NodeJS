import prisma from "../config/prisma.js";

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and roleId are required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No such user found" });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "No such role found" });
    }

    // Check if already assigned
    const hasRole = user.roles.some((r) => r.id === role.id);
    if (hasRole) {
      return res
        .status(409)
        .json({ success: false, message: "Already assigned to this user" });
    }

    // Assign role to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: { connect: { id: roleId } },
      },
    });

    // send success response
    return res
      .status(201)
      .json({ success: true, message: "Role assigned successfully" });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

export const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    if (!permissionId || !roleId) {
      return res.status(400).json({
        success: false,
        message: "permissionId and roleId are required",
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "No such role found" });
    }

    // Check if user exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!permission) {
      return res
        .status(404)
        .json({ success: false, message: "No such permission found" });
    }

    // Check if already assigned
    const hasPermission = role.permissions.some((p) => p.id === permission.id);
    if (hasPermission) {
      return res.status(409).json({
        success: false,
        message: "Permission already assigned to this role",
      });
    }

    // Assign permission to role
    await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { connect: { id: permissionId } },
      },
    });

    // send success response
    return res.status(201).json({
      success: true,
      message: "Permission assigned to this role successfully",
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};
