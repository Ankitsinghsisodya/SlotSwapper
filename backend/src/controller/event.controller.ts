import type { Request, Response } from "express";
import ApiError from "../utilities/ApiError.js";
import ApiResponse from "../utilities/ApiResponse.js";
import asyncHandler from "../utilities/asynchandler.js";
import { prisma } from "../utilities/prisma.js";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, startTime, endTime } = req.body;
  const ownerId = req.id;
  if (!ownerId) throw new ApiError(400, "User is not logged in");
  if (!title || !startTime || !endTime) {
    throw new ApiError(400, "Fields are missing");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid date and time format");
  }

  if (start >= end) {
    throw new ApiError(400, "startTime must be before endTime");
  }

  const created = await prisma.event.create({
    data: {
      title,
      startTime: start,
      endTime: end,
      ownerId: ownerId,
      status: "BUSY",
    },
  });

  res.json(new ApiResponse(200, created, "Event created successfully"));
});

export const myEvent = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.id;
  if (!ownerId) throw new ApiError(400, "User is not logged in");
  const events = await prisma.event.findMany({
    where: {
      ownerId,
    },
  });
  return res.json(
    new ApiResponse(200, events, "All the events sent successfully")
  );
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.id;
  if (!ownerId) throw new ApiError(400, "User is not logged in");
  const eventId = Number(req.params.id);
  if (isNaN(eventId) || eventId <= 0) {
    throw new ApiError(400, "Invalid event id");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  if (event.ownerId !== ownerId) {
    throw new ApiError(403, "Not authorized to delete this event");
  }

  // In a transaction: find dependent swap requests, set the opposite slots back to BUSY,
  // delete the swap requests, then delete the event.
  await prisma.$transaction(async (tx) => {
    const affectedSwapRequests = await tx.swapRequest.findMany({
      where: {
        OR: [{ requesterSlotId: eventId }, { responderSlotId: eventId }],
      },
      select: {
        id: true,
        requesterSlotId: true,
        responderSlotId: true,
      },
    });

    // collect the other slots that need to be reverted to BUSY
    const otherSlotIds: number[] = affectedSwapRequests.map((sr) =>
      sr.requesterSlotId === eventId ? sr.responderSlotId : sr.requesterSlotId
    );

    const uniqueOtherSlotIds = Array.from(new Set(otherSlotIds)).filter(Boolean);

    if (uniqueOtherSlotIds.length > 0) {
      await tx.event.updateMany({
        where: {
          id: { in: uniqueOtherSlotIds },
          status: "SWAP_PENDING",
        },
        data: {
          status: "BUSY",
        },
      });
    }

    // delete swap requests that referenced this event
    await tx.swapRequest.deleteMany({
      where: {
        OR: [{ requesterSlotId: eventId }, { responderSlotId: eventId }],
      },
    });

    // finally delete the event
    await tx.event.delete({
      where: { id: eventId },
    });
  });
  return res.json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.id;
  if (!ownerId) throw new ApiError(401, "User is not logged in");

  const eventId = Number(req.params.id);
  if (isNaN(eventId) || eventId <= 0) {
    throw new ApiError(400, "Invalid event id");
  }

  const { title, startTime, endTime, status } = req.body;

  // Find and verify ownership
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  if (event.ownerId !== ownerId) {
    throw new ApiError(403, "Not authorized to update this event");
  }

  // Build update data object
  const updateData: any = {};

  if (title !== undefined) updateData.title = title;
  if (status !== undefined) updateData.status = status;

  if (startTime !== undefined) {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      throw new ApiError(400, "Invalid startTime format");
    }
    updateData.startTime = start;
  }

  if (endTime !== undefined) {
    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid endTime format");
    }
    updateData.endTime = end;
  }

  // Validate start < end if both are being updated or one exists
  const finalStart = updateData.startTime || event.startTime;
  const finalEnd = updateData.endTime || event.endTime;
  if (finalStart >= finalEnd) {
    throw new ApiError(400, "startTime must be before endTime");
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });

  return res.json(new ApiResponse(200, updated, "Event updated successfully"));
});
