import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import express, { urlencoded } from "express";

import { errorHandlingMiddleware } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();


app.use(
    cors({ credentials: true, origin: "http://localhost:3000", exposedHeaders: ["Set-Cookie"] })
);

app.use(cookieParser());
app.use(urlencoded({ extended: true }));



app.use(express.json());



// Error handling middleware should be last
app.use(errorHandlingMiddleware);

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server is running fine",
  });
});

