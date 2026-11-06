import { PeopleClient } from "@/components/PeopleClient";
import { listPeople } from "@/lib/people";

export const dynamic = "force-dynamic";

export default function PeoplePage() {
  const people = listPeople(false);
  return <PeopleClient people={people} />;
}
