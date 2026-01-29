import { redirect } from "next/navigation";

export default function ShipRedirectPage({ params }: { params: { shipSlug: string } }) {
  redirect(`/cruises-from-galveston/${params.shipSlug}`);
}
