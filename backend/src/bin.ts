import { server } from "./index.js";
import dotenv from "dotenv";
dotenv.config();

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on PORT ${process.env.PORT}`);
  console.log(`WebSocket server is running on the same port`);
});
