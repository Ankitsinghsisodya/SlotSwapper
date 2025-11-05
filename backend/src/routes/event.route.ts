import express from "express";
import {
  createEvent,
  deleteEvent,
  myEvent,
} from "../controller/event.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-event", authMiddleware, createEvent);
router.get("/my-events", authMiddleware, myEvent);
router.delete("/delete-event/:id", authMiddleware, deleteEvent);
// router.put('/update-event/:id')
// router.get('/swap-response',)

export default router;
