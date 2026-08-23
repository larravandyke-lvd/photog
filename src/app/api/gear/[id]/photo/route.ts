import { NextResponse } from "next/server";

import { saveGearPhoto } from "@/lib/gear";
import { errorResponse } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

const ACCEPTED = new Set(["image/jpeg", "image/png"]);

/** A single capture is capped well under Vercel's request body limit. */
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const form = await request.formData();
    const photo = form.get("photo");

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Expected a `photo` file field." }, { status: 400 });
    }
    if (!ACCEPTED.has(photo.type)) {
      return NextResponse.json({ error: "Photo must be a JPEG or PNG." }, { status: 415 });
    }
    if (photo.size > MAX_BYTES) {
      return NextResponse.json({ error: "Photo is larger than 8 MB." }, { status: 413 });
    }

    const item = await saveGearPhoto(id, await photo.arrayBuffer(), photo.type);
    return NextResponse.json({ item });
  } catch (error) {
    return errorResponse(error);
  }
}
