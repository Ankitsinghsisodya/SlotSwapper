import express from "express";
import { swapIncomingRequests, swapOutgoingRequests, swappableSlots, swapRequest, swapResponse } from "../controller/swap.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/swappable-slots',authMiddleware, swappableSlots)
router.post('/swap-request',authMiddleware, swapRequest)
router.post('/swap-response',authMiddleware, swapResponse)
router.get('/swap-incoming-requests',authMiddleware, swapIncomingRequests)
router.get('/swap-outgoing-requests',authMiddleware, swapOutgoingRequests)

export default router;