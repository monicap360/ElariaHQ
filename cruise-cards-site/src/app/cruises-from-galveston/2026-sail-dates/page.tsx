import { redirect } from "next/navigation";

export default function SailDatesRedirect() {
  redirect("/cruises-from-galveston/calendar");
}
