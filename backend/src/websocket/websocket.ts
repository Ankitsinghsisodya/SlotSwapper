import { WebSocket } from "ws";

// Map to store user connections: userId -> WebSocket
let userConnections = new Map<number, WebSocket>();

// Function to initialize WebSocket handlers
export const initializeWebSocket = (wss: any) => {
  wss.on("connection", (ws: WebSocket) => {
    ws.on("error", console.error);

    ws.on("message", (message) => {
      const parsedMessage = JSON.parse(message.toString());

      // Register user connection
      if (parsedMessage.type === "register") {
        const userId = parsedMessage.payload.userId;
        if (userId) {
          userConnections.set(userId, ws);
          console.log(`User ${userId} connected to WebSocket`);
        }
      }

      // Keep alive ping
      if (parsedMessage.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    });

    ws.on("close", () => {
      // Remove user from connections when they disconnect
      for (const [userId, socket] of userConnections.entries()) {
        if (socket === ws) {
          userConnections.delete(userId);
          console.log(`User ${userId} disconnected from WebSocket`);
          break;
        }
      }
    });
  });
};

// Function to send notification to a specific user
export const sendNotificationToUser = (userId: number, notification: any) => {
  const userSocket = userConnections.get(userId);
  if (userSocket && userSocket.readyState === WebSocket.OPEN) {
    userSocket.send(JSON.stringify(notification));
    console.log(`Notification sent to user ${userId}:`, notification.type);
    return true;
  }
  console.log(`User ${userId} not connected or socket not ready`);
  return false;
};

export { userConnections };
