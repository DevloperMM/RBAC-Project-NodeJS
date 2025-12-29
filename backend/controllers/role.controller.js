import prisma from "../config/prisma.js";

export const createRole = async (req, res) => {
  try {
    // Validate input
    const { roleName, permissions } = req.body;
    if (
      !roleName ||
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Role name and permissions are required",
      });
    }

    // Two-step Server-side permission validations
    const ALLOWED_ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE", "ASSIGN"];

    // 1. Validate permissions structure
    for (const p of permissions) {
      if (
        !p.resource ||
        typeof p.resource !== "string" ||
        !ALLOWED_ACTIONS.includes(p.action)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid permission format",
        });
      }
    }

    // 2. Remove duplicates
    const uniquePermissions = Array.from(
      new Map(permissions.map((p) => [`${p.resource}:${p.action}`, p])).values()
    );

    // Check if role already exist
    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });
    if (existingRole) {
      return res
        .status(409)
        .json({ success: false, message: "Such role already exists" });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name: roleName,
        permissions: {
          connectOrCreate: uniquePermissions.map((p) => ({
            where: {
              resource_action: {
                resource: p.resource,
                action: p.action,
              },
            },
            create: {
              resource: p.resource,
              action: p.action,
            },
          })),
        },
      },
      include: { permissions: true },
    });

    return res
      .status(201)
      .json({ success: true, message: "Role successfully created", role });
  } catch (error) {
    return res
      .status(error?.status || 500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const viewRole = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
    });

    return res
      .status(201)
      .json({ success: true, message: "Fetched roles", roles });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid roleID passed" });
    }

    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return res
        .status(404)
        .json({ success: false, message: "No such role found" });
    }

    // Delete role - permissions related via cascade if configured or manually
    await prisma.role.delete({ where: { id } });

    return res.status(201).json({
      success: true,
      message: "Role deleted successfully !!",
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};
