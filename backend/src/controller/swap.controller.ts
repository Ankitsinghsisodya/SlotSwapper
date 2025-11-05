import type { Request, Response } from "express";
import ApiError from "../utilities/ApiError.js";
import ApiResponse from "../utilities/ApiResponse.js";
import asyncHandler from "../utilities/asynchandler.js";
import { prisma } from "../utilities/prisma.js";

export const swappableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.id;
    if (!userId) throw new ApiError(401, "User is not logged in");

    const slots = await prisma.event.findMany({
      where: {
        status: "SWAPPABLE",
        ownerId: { not: userId },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(new ApiResponse(200, slots, "All the swappableSlots"));
  }
);

export const swapRequest = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.id;
  const { responderId, requesterSlotId, responderSlotId } = req.body;
  if (!ownerId) throw new Error("User is not logged in");
  if (!responderId || !requesterSlotId || !responderSlotId) {
    throw new ApiError(400, "Fields are missing");
  }
  const requesterSlot = await prisma.event.findFirst({
    where: {
      id: requesterSlotId,
      ownerId: ownerId,
      status: "SWAPPABLE",
    },
  });
  if (!requesterSlot) {
    throw new ApiError(400, "Invalid requester slot");
  }
  const responderSlot = await prisma.event.findFirst({
    where: {
      id: responderSlotId,
      ownerId: responderId,
      status: "SWAPPABLE",
    },
  });
  if (!responderSlot) {
    throw new ApiError(400, "Invalid responder slot");
  }

  const swapRequest = await prisma.swapRequest.create({
    data: {
      requesterId: ownerId,
      responderId: responderId,
      requesterSlotId: requesterSlotId,
      responderSlotId: responderSlotId,
      status: "PENDING",
    },
  });

  await prisma.event.updateMany({
    where: {
      id: { in: [requesterSlotId, responderSlotId] },
    },
    data: {
      status: "SWAP_PENDING",
    },
  });


  return res.json(
    new ApiResponse(200, swapRequest, "Swap request created successfully")
  );
});

export const swapIncomingRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.id;
    if (!userId) throw new Error("User is not logged in");

   const incomingRequests = await prisma.swapRequest.findMany({
      where: {
        responderId: userId, // was incorrectly using responderId
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        responder: {
          select: {  name: true },
        },
        requesterSlot: {
          select: {  title: true, startTime: true, endTime: true, status: true},
        },
        responderSlot: {
          select: {  title: true, startTime: true, endTime: true, status: true },
        },
      },
    });


    return res.json(
      new ApiResponse(
        200,
        incomingRequests,
        "Incoming swap requests fetched successfully"
      )
    );
  }
);

export const swapOutgoingRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.id;
    if (!userId) throw new Error("User is not logged in");

   const outgoingRequests = await prisma.swapRequest.findMany({
      where: {
        requesterId: userId, // was incorrectly using responderId
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        responder: {
          select: {  name: true },
        },
        requesterSlot: {
          select: {  title: true, startTime: true, endTime: true, status: true},
        },
        responderSlot: {
          select: {  title: true, startTime: true, endTime: true, status: true },
        },
      },
    });


    return res.json(
      new ApiResponse(
        200,
        outgoingRequests,
        "Outgoing swap requests fetched successfully"
      )
    );
  }
);

export const swapResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.id;
    const { swapRequestId, response } = req.body;
    if (!userId) throw new Error("User is not logged in");
    if (!swapRequestId || !response) {
      throw new ApiError(400, "Fields are missing");
    }

    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        id: swapRequestId,
        responderId: userId,
        status: "PENDING",
      },
    });
    if (!swapRequest) {
      throw new ApiError(400, "Invalid swap request");
    }

    if (response === "ACCEPT") {
      // Swap the slots
      const requesterSlot = await prisma.event.findUnique({
        where: {
          id: swapRequest.requesterSlotId,
        },
      });
      const responderSlot = await prisma.event.findUnique({
        where: {
          id: swapRequest.responderSlotId,
        },
      });
      if (!requesterSlot || !responderSlot) {
        throw new ApiError(400, "Invalid slots for swapping");
      }

      await prisma.event.update({
        where: {
          id: requesterSlot.id,
        },
        data: {
          ownerId: swapRequest.responderId,
          status: "BUSY",
        },
      });

      await prisma.event.update({
        where: {
          id: responderSlot.id,
        },
        data: {
          ownerId: swapRequest.requesterId,
          status: "BUSY",
        },
      });

      // Update swap request status
      await prisma.swapRequest.update({
        where: {
          id: swapRequest.id,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      return res.json(
        new ApiResponse(
          200,
          null,
          "Swap request accepted and slots swapped successfully"
        )
      );
    } else if (response === "REJECT") {
      // Update swap request status
      await prisma.swapRequest.update({
        where: {
          id: swapRequest.id,
        },
        data: {
          status: "REJECTED",
        },
      });

      return res.json(
        new ApiResponse(200, null, "Swap request rejected successfully")
      );
    } else {
      throw new ApiError(400, "Invalid response");
    }
    res.json(
      new ApiResponse(200, null, "Swap response processed successfully")
    );
  }
);
