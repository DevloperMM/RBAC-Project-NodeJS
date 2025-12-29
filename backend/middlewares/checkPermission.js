import prisma from "../config/prisma.js";

export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // find user with all it's role permissions (by including them)
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No such user found",
        });
      }

      // check if the role isAdmin -> all permissions
      if (user.roles.some((role) => role.name === "admin")) return next();

      // else check if it has permission to do the action for given resource
      const hasPermission = user.roles.some((role) =>
        role.permissions.some(
          (perm) => perm.resource === resource && perm.action === action
        )
      );

      // Throw out of the response if not permitted
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Unauthorised request (Access denied)",
        });
      }

      next();
    } catch (error) {
      return res.status(error?.status || 500).json({
        success: false,
        message: error?.message || "Internal server error",
      });
    }
  };
};
