export interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING";
  ownerId: number;
  owner?: { id: number; name: string; email: string };
}

export interface SwapRequest {
  id: number;
  requesterId: number;
  responderId: number;
  requesterSlotId: number;
  responderSlotId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  requester: { id: number; name: string; email: string };
  responder: { id: number; name: string; email: string };
  requesterSlot: Event;
  responderSlot: Event;
  createdAt: string;
}
