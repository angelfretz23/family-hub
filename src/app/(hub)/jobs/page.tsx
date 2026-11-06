import { redirect } from "next/navigation";

/** Jobs live on the combined Routines tab. */
export default function JobsPage() {
  redirect("/routines");
}
