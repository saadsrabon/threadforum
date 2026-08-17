import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "threadsphere-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket) => {
  socket.on("join:user", (userId: string) => {
    if (typeof userId === "string" && userId.length > 0) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("disconnect", () => {
    // Presence cleanup will be added in Phase 4
  });
});

httpServer.listen(PORT, () => {
  console.log(`ThreadSphere API listening on http://localhost:${PORT}`);
});

export { app, io };
