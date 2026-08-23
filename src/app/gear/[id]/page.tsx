import { notFound } from "next/navigation";

import GearDetail from "@/components/GearDetail";
import { getGear } from "@/lib/gear";

export const dynamic = "force-dynamic";

export default async function GearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getGear(id);
  if (!item) notFound();

  return <GearDetail item={item} />;
}
