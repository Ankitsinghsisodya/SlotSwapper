import { server } from "./index.js";


server.listen(process.env.PORT, () => {
  console.log(`Server is listening on PORT ${process.env.PORT}`);
  console.log(`WebSocket server is running on the same port`);
});
