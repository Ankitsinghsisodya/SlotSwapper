import jwt from "jsonwebtoken";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type {
  Event,
  SwapRequest,
  User,
} from "../../generated/prisma/client.js";
import { server } from "../../index.js";
import { prisma } from "../../utilities/prisma.js";

// Mock the prisma client
vi.mock("../../utilities/prisma.js");

// Mock websocket notifications
vi.mock("../../websocket/websocket.js", () => ({
  sendNotificationToUser: vi.fn(),
  initializeWebSocket: vi.fn(),
}));

const TEST_USER_ID = 1;
const OTHER_USER_ID = 2;
const TEST_SECRET = "test-secret";

// Set the JWT_SECRET_KEY env variable for tests to match auth middleware
process.env.JWT_SECRET_KEY = TEST_SECRET;

const generateTestToken = (userId: number = TEST_USER_ID) => {
  return jwt.sign({ id: userId }, TEST_SECRET, { expiresIn: "1h" });
};

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: TEST_USER_ID,
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword",
  verified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 1,
  title: "Test Event",
  startTime: new Date("2025-11-27T10:00:00Z"),
  endTime: new Date("2025-11-27T11:00:00Z"),
  ownerId: TEST_USER_ID,
  status: "SWAPPABLE",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockSwapRequest = (
  overrides: Partial<SwapRequest> = {}
): SwapRequest => ({
  id: 1,
  requesterId: TEST_USER_ID,
  responderId: OTHER_USER_ID,
  requesterSlotId: 1,
  responderSlotId: 2,
  status: "PENDING",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Swap Controller - Integration Tests", () => {
  let authToken: string;
  let otherUserToken: string;

  beforeAll(() => {
    authToken = generateTestToken(TEST_USER_ID);
    otherUserToken = generateTestToken(OTHER_USER_ID);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock user lookup for auth middleware
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: TEST_USER_ID,
    } as any);
  });

  afterAll(() => {
    server.close();
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/swap/swappable-slots
  // ─────────────────────────────────────────────────────────────
  describe("GET /api/v1/swap/swappable-slots", () => {
    it("should return all swappable slots from other users", async () => {
      const fakeSlots = [
        createMockEvent({
          id: 1,
          title: "Slot A",
          ownerId: OTHER_USER_ID,
          status: "SWAPPABLE",
        }),
        createMockEvent({
          id: 2,
          title: "Slot B",
          ownerId: 3,
          status: "SWAPPABLE",
        }),
      ];

      vi.mocked(prisma.event.findMany).mockResolvedValue(fakeSlots as any);

      const response = await request(server)
        .get("/api/v1/swap/swappable-slots")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.message).toBe("All the swappableSlots");
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          status: "SWAPPABLE",
          ownerId: { not: TEST_USER_ID },
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server).get(
        "/api/v1/swap/swappable-slots"
      );

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/v1/swap/swap-request
  // ─────────────────────────────────────────────────────────────
  describe("POST /api/v1/swap/swap-request", () => {
    it("should create a swap request successfully", async () => {
      const requesterSlot = createMockEvent({
        id: 1,
        ownerId: TEST_USER_ID,
        status: "SWAPPABLE",
      });
      const responderSlot = createMockEvent({
        id: 2,
        ownerId: OTHER_USER_ID,
        status: "SWAPPABLE",
      });

      const fakeSwapRequest = {
        id: 1,
        requesterId: TEST_USER_ID,
        responderId: OTHER_USER_ID,
        requesterSlotId: 1,
        responderSlotId: 2,
        status: "PENDING",
        requester: {
          id: TEST_USER_ID,
          name: "Test User",
          email: "test@example.com",
        },
        requesterSlot: {
          id: 1,
          title: "Slot A",
          startTime: new Date(),
          endTime: new Date(),
        },
        responderSlot: {
          id: 2,
          title: "Slot B",
          startTime: new Date(),
          endTime: new Date(),
        },
      };

      vi.mocked(prisma.event.findFirst)
        .mockResolvedValueOnce(requesterSlot)
        .mockResolvedValueOnce(responderSlot);
      vi.mocked(prisma.swapRequest.create).mockResolvedValue(
        fakeSwapRequest as any
      );
      vi.mocked(prisma.event.updateMany).mockResolvedValue({ count: 2 });

      const response = await request(server)
        .post("/api/v1/swap/swap-request")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          responderId: OTHER_USER_ID,
          requesterSlotId: 1,
          responderSlotId: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(1);
      expect(response.body.message).toBe("Swap request created successfully");
    });

    it("should return 400 when fields are missing", async () => {
      const response = await request(server)
        .post("/api/v1/swap/swap-request")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          responderId: OTHER_USER_ID,
          // missing requesterSlotId and responderSlotId
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Fields are missing/i);
    });

    it("should return 400 when requester slot is invalid", async () => {
      vi.mocked(prisma.event.findFirst).mockResolvedValueOnce(null);

      const response = await request(server)
        .post("/api/v1/swap/swap-request")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          responderId: OTHER_USER_ID,
          requesterSlotId: 999,
          responderSlotId: 2,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid requester slot/i);
    });

    it("should return 400 when responder slot is invalid", async () => {
      const requesterSlot = createMockEvent({
        id: 1,
        ownerId: TEST_USER_ID,
        status: "SWAPPABLE",
      });

      vi.mocked(prisma.event.findFirst)
        .mockResolvedValueOnce(requesterSlot)
        .mockResolvedValueOnce(null);

      const response = await request(server)
        .post("/api/v1/swap/swap-request")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          responderId: OTHER_USER_ID,
          requesterSlotId: 1,
          responderSlotId: 999,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid responder slot/i);
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server)
        .post("/api/v1/swap/swap-request")
        .send({
          responderId: OTHER_USER_ID,
          requesterSlotId: 1,
          responderSlotId: 2,
        });

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/swap/swap-incoming-requests
  // ─────────────────────────────────────────────────────────────
  describe("GET /api/v1/swap/swap-incoming-requests", () => {
    it("should return incoming swap requests for the authenticated user", async () => {
      const fakeIncomingRequests = [
        {
          ...createMockSwapRequest({ id: 1, responderId: TEST_USER_ID }),
          requester: {
            id: OTHER_USER_ID,
            name: "Other User",
            email: "other@example.com",
          },
          responder: { name: "Test User" },
          requesterSlot: {
            title: "Slot A",
            startTime: new Date(),
            endTime: new Date(),
            status: "SWAP_PENDING",
          },
          responderSlot: {
            title: "Slot B",
            startTime: new Date(),
            endTime: new Date(),
            status: "SWAP_PENDING",
          },
        },
      ];

      vi.mocked(prisma.swapRequest.findMany).mockResolvedValue(
        fakeIncomingRequests as any
      );

      const response = await request(server)
        .get("/api/v1/swap/swap-incoming-requests")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.message).toBe(
        "Incoming swap requests fetched successfully"
      );
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server).get(
        "/api/v1/swap/swap-incoming-requests"
      );

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/swap/swap-outgoing-requests
  // ─────────────────────────────────────────────────────────────
  describe("GET /api/v1/swap/swap-outgoing-requests", () => {
    it("should return outgoing swap requests for the authenticated user", async () => {
      const fakeOutgoingRequests = [
        {
          ...createMockSwapRequest({ id: 1, requesterId: TEST_USER_ID }),
          requester: {
            id: TEST_USER_ID,
            name: "Test User",
            email: "test@example.com",
          },
          responder: { name: "Other User" },
          requesterSlot: {
            title: "Slot A",
            startTime: new Date(),
            endTime: new Date(),
            status: "SWAP_PENDING",
          },
          responderSlot: {
            title: "Slot B",
            startTime: new Date(),
            endTime: new Date(),
            status: "SWAP_PENDING",
          },
        },
      ];

      vi.mocked(prisma.swapRequest.findMany).mockResolvedValue(
        fakeOutgoingRequests as any
      );

      const response = await request(server)
        .get("/api/v1/swap/swap-outgoing-requests")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.message).toBe(
        "Outgoing swap requests fetched successfully"
      );
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server).get(
        "/api/v1/swap/swap-outgoing-requests"
      );

      expect(response.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/v1/swap/swap-response
  // ─────────────────────────────────────────────────────────────
  describe("POST /api/v1/swap/swap-response", () => {
    beforeEach(() => {
      // Set user as responderId for these tests
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: TEST_USER_ID,
      } as any);
    });

    it("should accept a swap request successfully", async () => {
      const fakeSwapRequest = createMockSwapRequest({
        id: 1,
        requesterId: OTHER_USER_ID,
        responderId: TEST_USER_ID,
        requesterSlotId: 1,
        responderSlotId: 2,
        status: "PENDING",
      });

      const requesterSlot = {
        ...createMockEvent({ id: 1, ownerId: OTHER_USER_ID }),
        owner: { id: OTHER_USER_ID, name: "Other User" },
      };
      const responderSlot = {
        ...createMockEvent({ id: 2, ownerId: TEST_USER_ID }),
        owner: { id: TEST_USER_ID, name: "Test User" },
      };

      vi.mocked(prisma.swapRequest.findFirst).mockResolvedValue(
        fakeSwapRequest
      );
      vi.mocked(prisma.event.findUnique)
        .mockResolvedValueOnce(requesterSlot as any)
        .mockResolvedValueOnce(responderSlot as any);
      vi.mocked(prisma.event.update).mockResolvedValue({} as any);
      vi.mocked(prisma.swapRequest.update).mockResolvedValue({} as any);

      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 1,
          response: "ACCEPT",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Swap request accepted and slots swapped successfully"
      );
    });

    it("should reject a swap request successfully", async () => {
      const fakeSwapRequest = createMockSwapRequest({
        id: 1,
        requesterId: OTHER_USER_ID,
        responderId: TEST_USER_ID,
        status: "PENDING",
      });

      vi.mocked(prisma.swapRequest.findFirst).mockResolvedValue(
        fakeSwapRequest
      );
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        name: "Test User",
      } as any);
      vi.mocked(prisma.swapRequest.update).mockResolvedValue({} as any);
      vi.mocked(prisma.event.updateMany).mockResolvedValue({ count: 2 });

      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 1,
          response: "REJECT",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Swap request rejected successfully");
    });

    it("should return 400 when fields are missing", async () => {
      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 1,
          // missing response
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Fields are missing/i);
    });

    it("should return 400 for invalid swap request", async () => {
      vi.mocked(prisma.swapRequest.findFirst).mockResolvedValue(null);

      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 999,
          response: "ACCEPT",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid swap request/i);
    });

    it("should return 400 for invalid response type", async () => {
      const fakeSwapRequest = createMockSwapRequest({
        id: 1,
        responderId: TEST_USER_ID,
        status: "PENDING",
      });

      vi.mocked(prisma.swapRequest.findFirst).mockResolvedValue(
        fakeSwapRequest
      );

      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 1,
          response: "MAYBE",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid response/i);
    });

    it("should return 400 when slots are invalid during accept", async () => {
      const fakeSwapRequest = createMockSwapRequest({
        id: 1,
        requesterId: OTHER_USER_ID,
        responderId: TEST_USER_ID,
        status: "PENDING",
      });

      vi.mocked(prisma.swapRequest.findFirst).mockResolvedValue(
        fakeSwapRequest
      );
      vi.mocked(prisma.event.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          swapRequestId: 1,
          response: "ACCEPT",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid slots for swapping/i);
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(server)
        .post("/api/v1/swap/swap-response")
        .send({
          swapRequestId: 1,
          response: "ACCEPT",
        });

      expect(response.status).toBe(401);
    });
  });
});
