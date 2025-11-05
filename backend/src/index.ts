import cookieParser from "cookie-parser";
import cors from "cors";
import type { Request, Response } from "express";
import express, { urlencoded } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { errorHandlingMiddleware } from "./middleware/error.middleware.js";
import authRoute from "./routes/auth.route.js";
import eventRoute from "./routes/event.route.js";
import swapRoute from "./routes/swap.route.js";
import { initializeWebSocket } from "./websocket/websocket.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize WebSocket handlers
initializeWebSocket(wss);

app.use(cors({
  origin: true, // Reflects the requesting origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server is running fine",
  });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/swap", swapRoute);
app.use("/api/v1/events", eventRoute);

// Error handling middleware should be last
app.use(errorHandlingMiddleware);

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on PORT ${process.env.PORT}`);
  console.log(`WebSocket server is running on the same port`);
});
