import { redirect } from "next/navigation";

export default async function ShipCalendarRedirect({ params }: { params: Promise<{ shipSlug: string }> }) {
  const { shipSlug } = await params;
  redirect(`/cruises-from-galveston/${shipSlug}`);
}
