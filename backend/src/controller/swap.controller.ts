import type { Request, Response } from "express";
import asyncHandler from "../utilities/asynchandler.js";
import { prisma } from "../utilities/prisma.js";
import ApiResponse from "../utilities/ApiResponse.js";
import ApiError from "../utilities/ApiError.js";

export const swappableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const slot = await prisma.event.findMany({
      where: { status: "SWAPPABLE" },
    });

    return res.json(new ApiResponse(200, slot, "All the swappableSlots"))
  }
);

export const swapRequest = asyncHandler(async (req:Request, res:Response) => {
    const ownerId = req.id;
    const {responderId, requesterSlotId, responderSlotId} = req.body;
    if(!ownerId) throw new Error("User is not logged in");
    if(!responderId || !requesterSlotId || !responderSlotId) {
        throw new ApiError(400,"Fields are missing");
    }
    const requesterSlot = await prisma.event.findFirst({
        where: {
            id: requesterSlotId,
            ownerId: ownerId,
            status: "SWAPPABLE"
        }
    })
    if(!requesterSlot) {
        throw new ApiError(400, "Invalid requester slot");
    }
    const responderSlot = await prisma.event.findFirst({
        where: {
            id: responderSlotId,
            ownerId: responderId,
            status: "SWAPPABLE"
        }
    })
    if(!responderSlot) {
        throw new ApiError(400, "Invalid responder slot");
    }

    const swapRequest = await prisma.swapRequest.create({
        data: {
            requesterId: ownerId,
            responderId: responderId,
            requesterSlotId: requesterSlotId,
            responderSlotId: responderSlotId,
            status: "PENDING"
        }
    })

    return res.json(new ApiResponse(200, swapRequest, "Swap request created successfully"))

})