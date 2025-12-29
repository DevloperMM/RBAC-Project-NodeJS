import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./config/prisma.js";

dotenv.config({ quiet: true });

import authRouter from "./routes/auth.routes.js";
import roleRouter from "./routes/role.routes.js";
import permissionRouter from "./routes/permission.routes.js";
import assignRouter from "./routes/assign.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/roles", roleRouter);
app.use("/permission", permissionRouter);
app.use("/assign", assignRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully" });
});

app.listen(PORT, async () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});

async function shutdown(signal) {
  try {
    console.log(`Prisma disconnecting due to (${signal})`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error disconnecting prisma: ", error);
    process.exit(1);
  }
}

// ["SIGINT", "SIGTERM"].forEach((signal) => {
//   process.on(signal, () => shutdown(signal));
// });
