"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PIPELINE_STAGES, getSourceLabel } from "@/lib/utils";
import { Phone, MessageCircle, MapPin, IndianRupee, Clock, Plus, GripVertical } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  score: number;
  budget: string | null;
  location: string | null;
  firstResponseAt: string | null;
  createdAt: string;
  agent: { id: string; name: string } | null;
}

const stageColors: Record<string, string> = {
  new_lead: "border-t-blue-500",
  contacted: "border-t-yellow-500",
  requirement_collected: "border-t-orange-500",
  property_suggested: "border-t-purple-500",
  visit_scheduled: "border-t-indigo-500",
  visit_completed: "border-t-teal-500",
  booked: "border-t-green-500",
  lost: "border-t-red-500",
};

const headerBg: Record<string, string> = {
  new_lead: "bg-blue-500/10",
  contacted: "bg-yellow-500/10",
  requirement_collected: "bg-orange-500/10",
  property_suggested: "bg-purple-500/10",
  visit_scheduled: "bg-indigo-500/10",
  visit_completed: "bg-teal-500/10",
  booked: "bg-green-500/10",
  lost: "bg-red-500/10",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const moveLead = async (leadId: string, newStatus: string) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchLeads();
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLead(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      moveLead(leadId, stageKey);
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Revenue engine — track leads through every stage"
      >
        <Link href="/leads">
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />Add Lead
          </Button>
        </Link>
      </PageHeader>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 180px)" }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const isDragOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-72 flex flex-col rounded-lg border ${stageColors[stage.key]} border-t-2 ${
                isDragOver ? "bg-accent/50 ring-2 ring-primary/50" : "bg-card/50"
              } transition-all`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-lg ${headerBg[stage.key]}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`group p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                      draggedLead === lead.id ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    {/* Lead Name + Source */}
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-2 hover:text-primary">
                        <Avatar name={lead.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium leading-tight">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone}</p>
                        </div>
                      </Link>
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Source badge */}
                    <Badge variant="outline" className="text-[10px] mb-2">{getSourceLabel(lead.source)}</Badge>

                    {/* Location + Budget */}
                    {(lead.location || lead.budget) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        {lead.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{lead.location}
                          </span>
                        )}
                        {lead.budget && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />₹{lead.budget}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Response time */}
                    {lead.firstResponseAt && (
                      <div className="flex items-center gap-1 text-xs text-green-500 mb-2">
                        <Clock className="h-3 w-3" />
                        {Math.round((new Date(lead.firstResponseAt).getTime() - new Date(lead.createdAt).getTime()) / 60000)} min response
                      </div>
                    )}

                    {/* Agent + Actions */}
                    <div className="flex items-center justify-between">
                      {lead.agent && (
                        <div className="flex items-center gap-1">
                          <Avatar name={lead.agent.name} size="sm" className="h-5 w-5 text-[8px]" />
                          <span className="text-xs text-muted-foreground">{lead.agent.name.split(" ")[0]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <a href={`tel:${lead.phone}`} className="p-1 rounded hover:bg-accent"><Phone className="h-3 w-3" /></a>
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-accent text-green-500">
                          <MessageCircle className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border border-dashed rounded-lg">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
