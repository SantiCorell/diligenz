import AssignedAgentCard from "@/components/dashboard/AssignedAgentCard";
import { getDashboardAgent } from "@/lib/agents";

export default async function DashboardAgentSlot({
  userId,
  userName,
  userEmail,
}: {
  userId: string;
  userName: string;
  userEmail: string;
}) {
  const { agent, nextMeeting } = await getDashboardAgent(userId);
  return (
    <AssignedAgentCard
      agent={agent}
      nextMeeting={nextMeeting}
      userName={userName}
      userEmail={userEmail}
    />
  );
}
