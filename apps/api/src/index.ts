import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.js";
import { communitiesRouter } from "./routes/communities.js";
import { feedRouter } from "./routes/feed.js";
import { interactionsRouter } from "./routes/interactions.js";
import { notificationsRouter } from "./routes/notifications.js";
import { searchRouter } from "./routes/search.js";
import { tagsRouter } from "./routes/tags.js";
import { threadsRouter } from "./routes/threads.js";
import { uploadsRouter } from "./routes/uploads.js";
import { usersRouter } from "./routes/users.js";
import { setSocketServer } from "./lib/socket.js";
import { SOCKET_EVENTS } from "@threadsphere/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const allowedOrigins = [
  CLIENT_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "threadsphere-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/communities", communitiesRouter);
app.use("/threads", threadsRouter);
app.use("/tags", tagsRouter);
app.use("/search", searchRouter);
app.use("/notifications", notificationsRouter);
app.use("/users", usersRouter);
app.use("/uploads", uploadsRouter);
app.use(interactionsRouter);

setSocketServer(io);

io.on("connection", (socket) => {
  socket.on(SOCKET_EVENTS.joinUser, (userId: string) => {
    if (typeof userId === "string" && userId.length > 0) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("join:thread", (threadId: string) => {
    if (typeof threadId === "string" && threadId.length > 0) {
      socket.join(`thread:${threadId}`);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`ThreadSphere API listening on http://localhost:${PORT}`);
});

export { app, io };
