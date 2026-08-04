"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { EmergencyLog } from "@/lib/types";

interface EmergencyHistoryProps {
  userId: string;
}

// Keeps a clear, chronological record of past SOS calls so seniors and
// their linked family can review what happened and when (report a.1).
export function EmergencyHistory({ userId }: EmergencyHistoryProps) {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergency_logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setLogs((data as EmergencyLog[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-ink-700">Loading history...</p>;
  if (logs.length === 0) return <p className="text-ink-700">No emergency calls logged yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => (
        <Card key={log.id} className="flex items-center gap-3">
          {log.status === "resolved" ? (
            <CheckCircle2 className="text-green-600" size={22} />
          ) : (
            <AlertCircle className="text-emergency" size={22} />
          )}
          <div>
            <p className="font-semibold">{formatDateTime(log.timestamp)}</p>
            <p className="text-sm capitalize text-ink-700">{log.status}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
