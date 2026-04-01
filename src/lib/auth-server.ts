import { NextRequest } from "next/server";

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-user-id") || null;
}

export function requireUserId(request: NextRequest): string {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    throw new Error("Unauthorized: x-user-id header is required");
  }
  return userId;
}
