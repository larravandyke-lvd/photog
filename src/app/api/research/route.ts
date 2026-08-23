import { NextResponse } from "next/server";

import { getGear, saveResearch } from "@/lib/gear";
import { errorResponse } from "@/lib/http";
import { researchGear } from "@/lib/research";

/** Web search plus two model turns runs well past the default serverless limit. */
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "`id` is required." }, { status: 400 });
    }

    const item = await getGear(body.id);
    if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const research = await researchGear(item);
    return NextResponse.json({ item: await saveResearch(item.id, research) });
  } catch (error) {
    return errorResponse(error);
  }
}
