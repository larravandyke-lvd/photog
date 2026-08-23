import { NextResponse } from "next/server";

import { deleteGear, getGear, updateGear } from "@/lib/gear";
import { errorResponse } from "@/lib/http";
import { parseGearInput } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const item = await getGear(id);
    if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });

    return NextResponse.json({ item });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const parsed = parseGearInput(await request.json(), { partial: true });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    return NextResponse.json({ item: await updateGear(id, parsed.value) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteGear(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
