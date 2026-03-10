"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { getScoreColor } from "@/lib/utils";
import {
  Users, Clock, Calendar, Bookmark, TrendingUp, Shield,
  AlertTriangle, Flame, Bell,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface DashboardData {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  visitsScheduled: number;
  bookingsClosed: number;
  avgResponseMin: number;
  conversionRate: number;
  slaCompliance: number;
  slaBreaches: number;
  agentPerformance: {
    id: string;
    name: string;
    activeLeads: number;
    bookedLeads: number;
    totalLeads: number;
    avgResponseTime: number;
    conversion: number;
  }[];
  needsAttention: {
    id: string;
    name: string;
    location: string;
    budget: string;
    agent: { name: string } | null;
    status: string;
  }[];
  hotLeads: {
    id: string;
    name: string;
    location: string;
    score: number;
  }[];
  pendingFollowUps: number;
  newToday: number;
}

const PIPELINE_COLORS = [
  "#3b82f6", "#eab308", "#f97316", "#a855f7",
  "#6366f1", "#14b8a6", "#22c55e", "#ef4444",
];

const SOURCE_COLORS = ["#25D366", "#3b82f6", "#E1306C", "#1877F2", "#f97316", "#8b5cf6"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard</div>;

  const pipelineData = [
    { name: "New", value: data.leadsByStatus["new_lead"] || 0 },
    { name: "Contacted", value: data.leadsByStatus["contacted"] || 0 },
    { name: "Requirement", value: data.leadsByStatus["requirement_collected"] || 0 },
    { name: "Property", value: data.leadsByStatus["property_suggested"] || 0 },
    { name: "Visit Sched.", value: data.leadsByStatus["visit_scheduled"] || 0 },
    { name: "Visit Done", value: data.leadsByStatus["visit_completed"] || 0 },
    { name: "Booked", value: data.leadsByStatus["booked"] || 0 },
    { name: "Lost", value: data.leadsByStatus["lost"] || 0 },
  ];

  const sourceKeys = ["phone_call", "whatsapp", "website", "instagram", "landing_page", "facebook"];
  const sourceLabels = ["Phone Call", "WhatsApp", "Website", "Instagram", "Landing Page", "Facebook"];
  const sourceData = sourceKeys.map((k, i) => ({
    name: sourceLabels[i],
    value: data.leadsBySource[k] || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Real-time overview of your sales pipeline" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<Users className="h-4 w-4" />} label="Total Leads" value={data.totalLeads} trend={12} color="text-blue-500" />
        <KPICard icon={<Clock className="h-4 w-4" />} label="Avg Response Time" value={`${data.avgResponseMin}min`} trend={-8} color="text-green-500" />
        <KPICard icon={<Calendar className="h-4 w-4" />} label="Visits Scheduled" value={data.visitsScheduled} trend={15} color="text-purple-500" />
        <KPICard icon={<Bookmark className="h-4 w-4" />} label="Bookings Closed" value={data.bookingsClosed} trend={22} color="text-emerald-500" />
        <KPICard icon={<TrendingUp className="h-4 w-4" />} label="Conversion Rate" value={`${data.conversionRate}%`} trend={5} color="text-orange-500" />
        <KPICard icon={<Shield className="h-4 w-4" />} label="SLA Compliance" value={`${data.slaCompliance}%`} trend={3} color="text-teal-500" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20"><Users className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{data.newToday}</p>
              <p className="text-xs text-muted-foreground">New Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
            <div>
              <p className="text-2xl font-bold">{data.slaBreaches}</p>
              <p className="text-xs text-muted-foreground">SLA Breaches</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pipeline Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((_, i) => (<Cell key={i} fill={PIPELINE_COLORS[i]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Lead Sources</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sourceData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sourceData.map((_, i) => (<Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {sourceData.filter((d) => d.value > 0).map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SOURCE_COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" />Needs Attention</CardTitle>
              <Badge variant="secondary">{data.needsAttention.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.needsAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">All leads are on track!</p>
            ) : data.needsAttention.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                <Avatar name={lead.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.location}{lead.budget ? ` · ₹${lead.budget}` : ""}</p>
                </div>
                <span className="text-xs text-orange-500">Awaiting</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-red-500" />Hot Leads</CardTitle>
              <Badge variant="secondary">Score ≥70</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.hotLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hot leads yet</p>
            ) : data.hotLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                <Avatar name={lead.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.location}</p>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-yellow-500" />Follow-ups</CardTitle>
              <Badge variant="secondary">{data.pendingFollowUps} pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.pendingFollowUps === 0 ? (
              <p className="text-sm text-muted-foreground">No pending follow-ups</p>
            ) : (
              <p className="text-sm text-yellow-500 font-medium">{data.pendingFollowUps} follow-up{data.pendingFollowUps > 1 ? "s" : ""} overdue</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Agent Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.agentPerformance.map((agent) => (
              <div key={agent.id} className="p-4 rounded-lg border bg-accent/30 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={agent.name} size="md" />
                  <p className="font-medium text-sm">{agent.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold">{agent.activeLeads}</p><p className="text-[10px] text-muted-foreground">active</p></div>
                  <div><p className="text-lg font-bold">{agent.avgResponseTime}m</p><p className="text-[10px] text-muted-foreground">avg</p></div>
                  <div><p className="text-lg font-bold">{agent.bookedLeads}</p><p className="text-[10px] text-muted-foreground">booked</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(agent.conversion, 100)}%` }} /></div>
                  <span className="text-xs font-medium">{agent.conversion}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">conversion</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: string | number; trend: number; color: string }) {
  const isPositive = trend >= 0;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-md bg-accent ${color}`}>{icon}</div>
          <div className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
