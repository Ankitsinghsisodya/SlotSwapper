import express from "express";
import { swapIncomingRequests, swapOutgoingRequests, swappableSlots, swapRequest } from "../controller/swap.controller.js";

const router = express.Router();

router.get('/swappable-slots',swappableSlots)
router.post('/swap-request',swapRequest)
// router.post('/swap-response',)
router.get('/swap-incoming-requests',swapIncomingRequests)
router.get('/swap-outgoing-requests',swapOutgoingRequests)

export default router;