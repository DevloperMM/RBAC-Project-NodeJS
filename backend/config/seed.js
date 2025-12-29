import prisma from "./prisma.js";

async function main() {
  // ADMIN PERMISSIONS
  const adminPermissions = [
    // users
    { resource: "users", action: "CREATE" },
    { resource: "users", action: "READ" },
    { resource: "users", action: "UPDATE" },
    { resource: "users", action: "DELETE" },
    // roles
    { resource: "roles", action: "CREATE" },
    { resource: "roles", action: "READ" },
    { resource: "roles", action: "UPDATE" },
    { resource: "roles", action: "DELETE" },
    // permissions
    { resource: "permissions", action: "CREATE" },
    { resource: "permissions", action: "READ" },
    { resource: "permissions", action: "UPDATE" },
    { resource: "permissions", action: "DELETE" },
    // resources
    { resource: "resources", action: "READ" },
  ];

  // CREATE ADMIN ROLE WITH PERMISSIONS
  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        create: adminPermissions,
      },
    },
  });

  console.log("Admin role created with id:", adminRole.id);

  // CREATE USER AND ASSIGN ADMIN ROLE
  const admin = await prisma.user.create({
    data: {
      name: "AdminDeveloper",
      email: "admin@gmail.com",
      // password: admin@12
      password: "$2b$10$Q7oflj3LZBaVK71oU/4Tc.YiWIlBDCECjIUC4RPM/ARiG2JLpKRtG",
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  console.log("Admin created with id:", admin.id);
}

main()
  .catch((err) => {
    console.error("Seed failed: ", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
