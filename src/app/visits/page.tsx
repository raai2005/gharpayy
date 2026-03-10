"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { Calendar, MapPin, Clock, Plus, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Visit {
  id: string;
  scheduledAt: string;
  confirmedAt: string | null;
  outcome: string | null;
  notes: string | null;
  status: string;
  lead: { id: string; name: string; phone: string };
  property: { id: string; name: string; location: string };
  agent: { id: string; name: string };
}

interface Lead {
  id: string;
  name: string;
  status: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
}

interface Agent {
  id: string;
  name: string;
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showOutcome, setShowOutcome] = useState<string | null>(null);

  const fetchVisits = () => {
    fetch("/api/visits").then((r) => r.json()).then(setVisits).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits();
    fetch("/api/leads").then((r) => r.json()).then(setLeads);
    fetch("/api/properties").then((r) => r.json()).then(setProperties);
    fetch("/api/agents").then((r) => r.json()).then(setAgents);
  }, []);

  const now = new Date();
  const upcoming = visits.filter((v) => new Date(v.scheduledAt) >= now && v.status !== "completed" && v.status !== "cancelled");
  const completed = visits.filter((v) => v.status === "completed");

  const scheduleVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: form.get("leadId"),
        propertyId: form.get("propertyId"),
        agentId: form.get("agentId"),
        scheduledAt: form.get("scheduledAt"),
      }),
    });
    setShowSchedule(false);
    fetchVisits();
  };

  const confirmVisit = async (visitId: string) => {
    await fetch(`/api/visits/${visitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    fetchVisits();
  };

  const recordOutcome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showOutcome) return;
    const form = new FormData(e.currentTarget);
    await fetch(`/api/visits/${showOutcome}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        outcome: form.get("outcome"),
        notes: form.get("notes"),
      }),
    });
    setShowOutcome(null);
    fetchVisits();
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-green-500/20 text-green-400",
    completed: "bg-teal-500/20 text-teal-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Visits" description="Manage property visits and track outcomes">
        <Button size="sm" onClick={() => setShowSchedule(true)}>
          <Plus className="h-4 w-4 mr-1" />Schedule Visit
        </Button>
      </PageHeader>

      {/* Upcoming Visits */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Upcoming ({upcoming.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming visits</p>
          ) : upcoming.map((visit) => (
            <div key={visit.id} className="flex items-center gap-4 p-4 rounded-lg border bg-accent/20 hover:bg-accent/30 transition-colors">
              <Avatar name={visit.lead.name} size="md" />
              <div className="flex-1">
                <p className="font-medium">{visit.lead.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{visit.property.name} - {visit.property.location}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(visit.scheduledAt), "MMM d, h:mm a")}</span>
                  <span>{visit.agent.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[visit.status]}>{visit.status}</Badge>
                {visit.status === "scheduled" && (
                  <Button size="sm" variant="outline" onClick={() => confirmVisit(visit.id)}>Confirm</Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => setShowOutcome(visit.id)}>Record outcome</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completed Visits */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Completed Visits</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Lead</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Property</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Agent</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {completed.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No completed visits</td></tr>
              ) : completed.map((visit) => (
                <tr key={visit.id} className="border-b hover:bg-accent/30">
                  <td className="p-3">{visit.lead.name}</td>
                  <td className="p-3">{visit.property.name} - {visit.property.location}</td>
                  <td className="p-3">{format(new Date(visit.scheduledAt), "MMM d, h:mm a")}</td>
                  <td className="p-3">{visit.agent.name}</td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{visit.outcome || "—"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Schedule Visit Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogHeader><DialogTitle>Schedule Visit</DialogTitle></DialogHeader>
        <form onSubmit={scheduleVisit} className="space-y-4">
          <Select name="leadId" placeholder="Select Lead" options={leads.filter((l) => !["booked", "lost"].includes(l.status)).map((l) => ({ value: l.id, label: l.name }))} />
          <Select name="propertyId" placeholder="Select Property" options={properties.map((p) => ({ value: p.id, label: `${p.name} - ${p.location} (₹${p.price})` }))} />
          <Select name="agentId" placeholder="Select Agent" options={agents.map((a) => ({ value: a.id, label: a.name }))} />
          <Input name="scheduledAt" type="datetime-local" required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </Dialog>

      {/* Record Outcome Dialog */}
      <Dialog open={!!showOutcome} onOpenChange={(open) => { if (!open) setShowOutcome(null); }}>
        <DialogHeader><DialogTitle>Record Visit Outcome</DialogTitle></DialogHeader>
        <form onSubmit={recordOutcome} className="space-y-4">
          <Select name="outcome" placeholder="Select Outcome" options={[
            { value: "booked", label: "Booked ✅" },
            { value: "considering", label: "Considering 🤔" },
            { value: "not_interested", label: "Not Interested ❌" },
          ]} />
          <Input name="notes" placeholder="Notes (optional)" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowOutcome(null)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
