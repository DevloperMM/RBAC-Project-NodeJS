import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./config/prisma.js";

dotenv.config({ quiet: true });

import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully" });
});

app.use("/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`Prisma disconnecting due to (${signal})`);
  await prisma.$disconnect();
  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
