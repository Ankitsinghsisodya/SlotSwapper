import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { server } from "../../index.js";
import { prisma } from "../../utilities/prisma.js";
import type { Event } from "../../generated/prisma/client.js";

// Mock the prisma client
vi.mock("../../utilities/prisma.js");


const TEST_USER_ID = 1;
const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
const generateTestToken = (userId: number = TEST_USER_ID) => {
  return jwt.sign({ id: userId }, TEST_SECRET, { expiresIn: "1h" });
};


const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 1,
  title: "Test Event",
  startTime: new Date("2025-11-27T10:00:00Z"),
  endTime: new Date("2025-11-27T11:00:00Z"),
  ownerId: TEST_USER_ID,
  status: "BUSY",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Event Controller - Integration Tests", () => {
  let authToken: string;

  beforeAll(() => {
    authToken = generateTestToken();
  });

  // beforeEach(() => {
  //   vi.clearAllMocks();
  // });

  afterAll(() => {
    server.close();
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/v1/events/create-event
  // ─────────────────────────────────────────────────────────────
  describe("POST /api/v1/events/create-event", () => {
    it("should create an event successfully", async () => {
      const fakeCreated = createMockEvent({
        id: 123,
        title: "Team Meeting",
        startTime: new Date("2025-11-27T10:00:00Z"),
        endTime: new Date("2025-11-27T11:00:00Z"),
      });

      vi.mocked(prisma.event.create).mockResolvedValue(fakeCreated);

      const response = await request(server)
        .post("/api/v1/events/create-event")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Team Meeting",
          startTime: "2025-11-27T10:00:00Z",
          endTime: "2025-11-27T11:00:00Z",
        });

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(123);
      expect(response.body.message).toBe("Event created successfully");
      expect(prisma.event.create).toHaveBeenCalledOnce();
    });

    it("should return 400 when fields are missing", async () => {
      const response = await request(server)
        .post("/api/v1/events/create-event")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Team Meeting",
          // missing startTime and endTime
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Fields are missing/i);
    });

    it("should return 400 for invalid date format", async () => {
      const response = await request(server)
        .post("/api/v1/events/create-event")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Bad Event",
          startTime: "not-a-date",
          endTime: "also-not-a-date",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid date/i);
    });

    it("should return 400 when startTime >= endTime", async () => {
      const response = await request(server)
        .post("/api/v1/events/create-event")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Invalid Range",
          startTime: "2025-11-27T12:00:00Z",
          endTime: "2025-11-27T10:00:00Z",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/startTime must be before endTime/i);
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server)
        .post("/api/v1/events/create-event")
        .send({
          title: "Team Meeting",
          startTime: "2025-11-27T10:00:00Z",
          endTime: "2025-11-27T11:00:00Z",
        });

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/events/my-events
  // ─────────────────────────────────────────────────────────────
  describe("GET /api/v1/events/my-events", () => {
    it("should return events for the authenticated user", async () => {
      const fakeEvents = [
        createMockEvent({ id: 1, title: "Event A", status: "BUSY" }),
        createMockEvent({ id: 2, title: "Event B", status: "SWAPPABLE" }),
      ];

      vi.mocked(prisma.event.findMany).mockResolvedValue(fakeEvents);

      const response = await request(server)
        .get("/api/v1/events/my-events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.message).toBe("All the events sent successfully");
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { ownerId: TEST_USER_ID },
      });
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server).get("/api/v1/events/my-events");

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PUT /api/v1/events/update-event/:id
  // ─────────────────────────────────────────────────────────────
  describe("PUT /api/v1/events/update-event/:id", () => {
    it("should update an event successfully", async () => {
      const existingEvent = createMockEvent({
        id: 1,
        title: "Old Title",
      });

      const updatedEvent = createMockEvent({
        id: 1,
        title: "New Title",
      });

      vi.mocked(prisma.event.findUnique).mockResolvedValue(existingEvent);
      vi.mocked(prisma.event.update).mockResolvedValue(updatedEvent);

      const response = await request(server)
        .put("/api/v1/events/update-event/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("New Title");
      expect(response.body.message).toBe("Event updated successfully");
    });

    it("should return 404 when event not found", async () => {
      vi.mocked(prisma.event.findUnique).mockResolvedValue(null);

      const response = await request(server)
        .put("/api/v1/events/update-event/999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/Event not found/i);
    });

    it("should return 403 when user is not authorized", async () => {
      const otherUserEvent = createMockEvent({
        id: 1,
        title: "Other User Event",
        ownerId: 999, // different owner
      });

      vi.mocked(prisma.event.findUnique).mockResolvedValue(otherUserEvent);

      const response = await request(server)
        .put("/api/v1/events/update-event/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Trying to update" });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Not authorized/i);
    });

    it("should return 400 for invalid event id", async () => {
      const response = await request(server)
        .put("/api/v1/events/update-event/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "New Title" });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid event id/i);
    });

    it("should return 400 when startTime >= endTime after update", async () => {
      const existingEvent = createMockEvent({
        id: 1,
        title: "Test Event",
      });

      vi.mocked(prisma.event.findUnique).mockResolvedValue(existingEvent);

      const response = await request(server)
        .put("/api/v1/events/update-event/1")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          startTime: "2025-11-27T14:00:00Z",
          endTime: "2025-11-27T12:00:00Z",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/startTime must be before endTime/i);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /api/v1/events/delete-event/:id
  // ─────────────────────────────────────────────────────────────
  describe("DELETE /api/v1/events/delete-event/:id", () => {
    it("should delete an event successfully", async () => {
      const existingEvent = createMockEvent({
        id: 1,
        title: "Event to Delete",
      });

      vi.mocked(prisma.event.findUnique).mockResolvedValue(existingEvent);
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        // Mock the transaction callback
        const mockTx = {
          swapRequest: {
            findMany: vi.fn().mockResolvedValue([]),
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          event: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            delete: vi.fn().mockResolvedValue(existingEvent),
          },
        };
        return fn(mockTx);
      });

      const response = await request(server)
        .delete("/api/v1/events/delete-event/1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Event deleted successfully");
    });

    it("should return 404 when event not found", async () => {
      vi.mocked(prisma.event.findUnique).mockResolvedValue(null);

      const response = await request(server)
        .delete("/api/v1/events/delete-event/999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/Event not found/i);
    });

    it("should return 403 when user is not authorized to delete", async () => {
      const otherUserEvent = createMockEvent({
        id: 1,
        title: "Other User Event",
        ownerId: 999, // different owner
      });

      vi.mocked(prisma.event.findUnique).mockResolvedValue(otherUserEvent);

      const response = await request(server)
        .delete("/api/v1/events/delete-event/1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Not authorized/i);
    });

    it("should return 400 for invalid event id", async () => {
      const response = await request(server)
        .delete("/api/v1/events/delete-event/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid event id/i);
    });

    it("should handle deleting event with associated swap requests", async () => {
      const existingEvent = createMockEvent({
        id: 1,
        title: "Event with swaps",
        status: "SWAP_PENDING",
      });

      const associatedSwapRequests = [
        { id: 1, requesterSlotId: 1, responderSlotId: 2 },
        { id: 2, requesterSlotId: 3, responderSlotId: 1 },
      ];

      vi.mocked(prisma.event.findUnique).mockResolvedValue(existingEvent);
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        const mockTx = {
          swapRequest: {
            findMany: vi.fn().mockResolvedValue(associatedSwapRequests),
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          event: {
            updateMany: vi.fn().mockResolvedValue({ count: 2 }),
            delete: vi.fn().mockResolvedValue(existingEvent),
          },
        };
        return fn(mockTx);
      });

      const response = await request(server)
        .delete("/api/v1/events/delete-event/1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Event deleted successfully");
    });
  });
});
