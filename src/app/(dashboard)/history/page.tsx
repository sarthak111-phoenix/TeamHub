import { getCurrentUser } from "@/lib/auth";
import { getCompletedHistory } from "@/lib/actions/history";
import { HistoryClient } from "./history-client";

export default async function HistoryPage() {
  await getCurrentUser();
  const historyItems = await getCompletedHistory();

  return <HistoryClient initialItems={historyItems} />;
}
