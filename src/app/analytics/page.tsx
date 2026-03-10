"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { PIPELINE_STAGES } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from "recharts";

interface DashboardData {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  agentPerformance: {
    id: string;
    name: string;
    activeLeads: number;
    bookedLeads: number;
    totalLeads: number;
    avgResponseTime: number;
    conversion: number;
  }[];
}

const FUNNEL_COLORS = ["#3b82f6", "#eab308", "#f97316", "#a855f7", "#6366f1", "#14b8a6", "#22c55e"];
const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  website: "#3b82f6",
  instagram: "#E1306C",
  facebook: "#1877F2",
  phone_call: "#f97316",
  landing_page: "#8b5cf6",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const funnelStages = PIPELINE_STAGES.filter((s) => s.key !== "lost").map((stage) => ({
    name: stage.label,
    value: data.leadsByStatus[stage.key] || 0,
  }));

  // Calculate drop-offs
  const dropOffs: { from: string; to: string; rate: number }[] = [];
  for (let i = 0; i < funnelStages.length - 1; i++) {
    if (funnelStages[i].value > 0) {
      const rate = Math.round(((funnelStages[i].value - funnelStages[i + 1].value) / funnelStages[i].value) * 100);
      dropOffs.push({ from: funnelStages[i].name, to: funnelStages[i + 1].name, rate });
    }
  }

  const sourceData = Object.entries(data.leadsBySource).map(([key, val]) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: val,
    fill: SOURCE_COLORS[key] || "#6b7280",
  }));

  // Sort agents by conversion
  const sortedAgents = [...data.agentPerformance].sort((a, b) => b.conversion - a.conversion || b.bookedLeads - a.bookedLeads);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Performance metrics and insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {funnelStages.map((stage, i) => {
                const maxVal = Math.max(...funnelStages.map((s) => s.value), 1);
                const width = Math.max((stage.value / maxVal) * 100, 10);
                return (
                  <div key={stage.name}>
                    <div className="flex items-center gap-3">
                      <div className="w-36 text-xs text-right text-muted-foreground">{stage.name}</div>
                      <div className="flex-1 relative">
                        <div
                          className="h-8 rounded-md flex items-center px-3 text-xs font-bold text-white transition-all"
                          style={{
                            width: `${width}%`,
                            backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                          }}
                        >
                          {stage.value}
                        </div>
                      </div>
                    </div>
                    {i < funnelStages.length - 1 && dropOffs[i] && dropOffs[i].rate > 0 && (
                      <div className="ml-40 text-[10px] text-red-400 my-0.5">
                        ↓ {dropOffs[i].rate}% drop-off
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lead Source ROI */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Lead Source ROI</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData} layout="vertical">
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Leaderboard */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Agent Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedAgents.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg border bg-accent/20 hover:bg-accent/30">
                <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                <Avatar name={agent.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agent.activeLeads} active · {agent.avgResponseTime}m avg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{agent.conversion}%</p>
                  <p className="text-xs text-muted-foreground">{agent.bookedLeads}/{agent.totalLeads}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
