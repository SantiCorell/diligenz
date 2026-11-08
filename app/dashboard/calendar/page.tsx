import { redirect } from "next/navigation";
import MeetingsCalendar from "@/components/dashboard/MeetingsCalendar";
import { getSessionWithUser } from "@/lib/session";

export default async function DashboardCalendarPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="page-eyebrow">Agenda</p>
        <h1 className="page-title mt-2">Mi calendario</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/75 sm:text-base">
          Las reuniones que reserves con tu agente quedan aquí. También puedes descargarlas para añadirlas a Google, Apple u Outlook.
        </p>
      </header>
      <MeetingsCalendar />
    </div>
  );
}
