import { NextResponse } from "next/server";

/** Turns a thrown error into a JSON response without leaking a stack trace. */
export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error.";
  console.error(error);
  return NextResponse.json({ error: message }, { status });
}
