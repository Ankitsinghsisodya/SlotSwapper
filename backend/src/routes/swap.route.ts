import express from "express";
import { swappableSlots } from "../controller/swap.controller.js";

const router = express.Router();

router.get('/swappable-slots',swappableSlots)
// router.get('/swap-request/:id',)
// router.get('/swap-response',)
// router.get('/swap-incoming-requests',)
// router.get('/swap-outgoing-requests',)

export default router;