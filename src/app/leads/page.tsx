"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { getStageLabel, getStageColor, getSourceLabel, PIPELINE_STAGES, LEAD_SOURCES } from "@/lib/utils";
import { Search, Plus, Phone, MessageCircle, Download } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  status: string;
  score: number;
  budget: string | null;
  location: string | null;
  createdAt: string;
  agent: { id: string; name: string } | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchLeads = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sourceFilter) params.set("source", sourceFilter);

    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then(setLeads)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      source: form.get("source"),
      budget: form.get("budget"),
      location: form.get("location"),
    };
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAddDialog(false);
    fetchLeads();
  };

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

  return (
    <div className="space-y-6">
      <PageHeader title="All Leads" description={`${leads.length} leads found`}>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />Add Lead
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          options={PIPELINE_STAGES.map((s) => ({ value: s.key, label: s.label }))}
          placeholder="All Stages"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
        <Select
          options={LEAD_SOURCES.map((s) => ({ value: s.key, label: s.label }))}
          placeholder="All Sources"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Source</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Agent</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No leads found</td></tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-accent/30 transition-colors cursor-pointer">
                    <td className="p-3">
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-2 hover:text-primary">
                        <Avatar name={lead.name} size="sm" />
                        <span className="font-medium">{lead.name}</span>
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{lead.phone}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{getSourceLabel(lead.source)}</Badge></td>
                    <td className="p-3"><Badge className={`text-xs ${stageColorMap[lead.status] || ""}`}>{getStageLabel(lead.status)}</Badge></td>
                    <td className="p-3 font-semibold">{lead.score}</td>
                    <td className="p-3 text-muted-foreground">{lead.agent?.name || "Unassigned"}</td>
                    <td className="p-3 text-muted-foreground">{lead.location || "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <a href={`tel:${lead.phone}`} className="p-1.5 rounded-md hover:bg-accent" title="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-accent text-green-500" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
        <form onSubmit={handleAddLead} className="space-y-4">
          <Input name="name" placeholder="Full Name" required />
          <Input name="phone" placeholder="Phone Number (e.g. +919876543210)" required />
          <Input name="email" placeholder="Email (optional)" type="email" />
          <Select name="source" options={LEAD_SOURCES.map((s) => ({ value: s.key, label: s.label }))} placeholder="Lead Source" />
          <Input name="budget" placeholder="Budget Range (e.g. 8000-12000)" />
          <Input name="location" placeholder="Preferred Location" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
