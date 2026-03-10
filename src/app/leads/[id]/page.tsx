"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { getStageLabel, getSourceLabel, PIPELINE_STAGES } from "@/lib/utils";
import {
  ArrowLeft, Phone, MessageCircle, MapPin, IndianRupee,
  Clock, User, Calendar, FileText, ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  status: string;
  score: number;
  budget: string | null;
  location: string | null;
  notes: string | null;
  lostReason: string | null;
  createdAt: string;
  firstResponseAt: string | null;
  lastActivityAt: string | null;
  agent: { id: string; name: string; email: string } | null;
  visits: {
    id: string;
    scheduledAt: string;
    status: string;
    outcome: string | null;
    property: { name: string; location: string };
    agent: { name: string };
  }[];
  activities: {
    id: string;
    type: string;
    content: string;
    createdAt: string;
    agent: { name: string } | null;
  }[];
  followUps: {
    id: string;
    type: string;
    dueAt: string;
    completedAt: string | null;
  }[];
}

interface Agent {
  id: string;
  name: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");

  const fetchLead = () => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then(setLead)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLead();
    fetch("/api/agents").then((r) => r.json()).then(setAgents);
  }, [id]);

  const updateLead = async (data: Record<string, string>) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchLead();
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await fetch(`/api/leads/${id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "note",
        content: noteText,
        agentId: lead?.agent?.id,
      }),
    });
    setNoteText("");
    fetchLead();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) return <div>Lead not found</div>;

  const stageColorMap: Record<string, string> = {
    new_lead: "bg-blue-500/20 text-blue-400",
    contacted: "bg-yellow-500/20 text-yellow-400",
    requirement_collected: "bg-orange-500/20 text-orange-400",
    property_suggested: "bg-purple-500/20 text-purple-400",
    visit_scheduled: "bg-indigo-500/20 text-indigo-400",
    visit_completed: "bg-teal-500/20 text-teal-400",
    booked: "bg-green-500/20 text-green-400",
    lost: "bg-red-500/20 text-red-400",
  };

  const activityIcons: Record<string, string> = {
    note: "📝",
    call: "📞",
    message: "💬",
    stage_change: "🔄",
    visit: "🏠",
    assignment: "👤",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar name={lead.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={stageColorMap[lead.status]}>{getStageLabel(lead.status)}</Badge>
                <Badge variant="outline">{getSourceLabel(lead.source)}</Badge>
                <span className="text-sm text-muted-foreground">Score: <strong>{lead.score}</strong></span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-accent hover:bg-accent/80 text-sm">
            <Phone className="h-4 w-4" />Call
          </a>
          <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-green-500/20 text-green-500 hover:bg-green-500/30 text-sm">
            <MessageCircle className="h-4 w-4" />WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Stepper */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Pipeline Stage</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {PIPELINE_STAGES.map((stage, i) => {
                  const isActive = lead.status === stage.key;
                  const isPast = PIPELINE_STAGES.findIndex((s) => s.key === lead.status) > i;
                  return (
                    <button
                      key={stage.key}
                      onClick={() => updateLead({ status: stage.key })}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        isActive ? `${stage.color} text-white` : isPast ? "bg-accent text-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {stage.label}
                      {i < PIPELINE_STAGES.length - 1 && <ChevronRight className="h-3 w-3 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Add Note</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type a note..."
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                />
                <Button onClick={addNote} size="sm">Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lead.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities yet</p>
                ) : lead.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="text-lg">{activityIcons[activity.type] || "📌"}</div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.agent?.name ? `${activity.agent.name} · ` : ""}
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - sidebar info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.location}</span>
                </div>
              )}
              {lead.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>₹{lead.budget}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Agent */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Assigned Agent</CardTitle></CardHeader>
            <CardContent>
              {lead.agent ? (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={lead.agent.name} size="md" />
                  <div>
                    <p className="text-sm font-medium">{lead.agent.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.agent.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">Unassigned</p>
              )}
              <Select
                options={agents.map((a) => ({ value: a.id, label: a.name }))}
                placeholder="Reassign to..."
                onChange={(e) => e.target.value && updateLead({ agentId: e.target.value })}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* SLA */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">SLA Tracking</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {lead.firstResponseAt ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">First Response: </span>
                  <span className="font-medium">
                    {Math.round((new Date(lead.firstResponseAt).getTime() - new Date(lead.createdAt).getTime()) / 60000)} min
                  </span>
                </div>
              ) : (
                <p className="text-sm text-orange-500 font-medium">⚠ No response yet</p>
              )}
              {lead.lastActivityAt && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Activity: </span>
                  <span>{formatDistanceToNow(new Date(lead.lastActivityAt), { addSuffix: true })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visits */}
          {lead.visits.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Visits</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {lead.visits.map((visit) => (
                  <div key={visit.id} className="p-2 rounded-lg bg-accent/30 text-sm">
                    <p className="font-medium">{visit.property.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(visit.scheduledAt).toLocaleDateString()} · {visit.status}
                      {visit.outcome && ` · ${visit.outcome}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
