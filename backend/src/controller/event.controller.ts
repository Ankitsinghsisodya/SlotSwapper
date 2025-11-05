import type { Request, Response } from "express";
import asyncHandler from "../utilities/asynchandler.js";
import ApiResponse from "../utilities/ApiResponse.js";
import ApiError from "../utilities/ApiError.js";
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
    where:{
        ownerId
    }
  })
  return res.json(new ApiResponse(200, events, "All the events sent successfully"))
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.id;
  if (!ownerId) throw new ApiError(400, "User is not logged in");
  const eventId = Number(req.params.id)
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

  await prisma.event.delete({ 
    where:{
        id:eventId
    }
  })
  return res.json(new ApiResponse(200, {}, "All the events sent successfully"))
});

// export const updateEvent = asyncHandler(async (req:Request, res:Response) => {
//   const ownerId = req.id;
//   if (!ownerId) throw new ApiError(400, "User is not logged in");
//   const eventId = Number(req.params.id)
//    if (isNaN(eventId) || eventId <= 0) {
//     throw new ApiError(400, "Invalid event id");
//   }

//   const event = await prisma.event.findUnique({ where: { id: eventId } });
//   if (!event) {
//     throw new ApiError(404, "Event not found");
//   }
//   if (event.ownerId !== ownerId) {
//     throw new ApiError(403, "Not authorized to delete this event");
//   }

//   await prisma.event.update({ 
//     where:{
//         id:eventId
//     },data:{

//     }
//   })
//   return res.json(new ApiResponse(200, {}, "All the events sent successfully"))
// })
