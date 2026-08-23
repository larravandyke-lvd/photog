import { NextResponse } from "next/server";

import { createGear, listGear } from "@/lib/gear";
import { errorResponse } from "@/lib/http";
import { parseGearInput } from "@/lib/validate";

export async function GET() {
  try {
    return NextResponse.json({ items: await listGear() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = parseGearInput(await request.json());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    return NextResponse.json({ item: await createGear(parsed.value) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
