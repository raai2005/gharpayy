import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PIPELINE_STAGES } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      agent: true,
      visits: { include: { property: true, agent: true }, orderBy: { scheduledAt: "desc" } },
      activities: { include: { agent: true }, orderBy: { createdAt: "desc" } },
      followUps: { orderBy: { dueAt: "asc" } },
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  const activities: { leadId: string; agentId?: string; type: string; content: string }[] = [];

  // Status change
  if (body.status && body.status !== lead.status) {
    const stageLabels = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.key, s.label]));
    updateData.status = body.status;
    updateData.lastActivityAt = new Date();

    // Update score based on stage
    const scoreMap: Record<string, number> = {
      new_lead: 15, contacted: 35, requirement_collected: 50,
      property_suggested: 70, visit_scheduled: 85, visit_completed: 100,
      booked: 100, lost: 10,
    };
    updateData.score = scoreMap[body.status] || lead.score;

    // First response tracking
    if (lead.status === "new_lead" && body.status === "contacted" && !lead.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    activities.push({
      leadId: id,
      agentId: lead.agentId || undefined,
      type: "stage_change",
      content: `Status changed from ${stageLabels[lead.status] || lead.status} to ${stageLabels[body.status] || body.status}`,
    });

    // Create follow-ups for stage changes
    if (body.status !== "booked" && body.status !== "lost") {
      const day3 = new Date();
      day3.setDate(day3.getDate() + 3);
      await prisma.followUp.create({
        data: { leadId: id, type: "day3", dueAt: day3 },
      });
    }
  }

  if (body.lostReason) updateData.lostReason = body.lostReason;
  if (body.agentId) {
    updateData.agentId = body.agentId;
    const newAgent = await prisma.agent.findUnique({ where: { id: body.agentId } });
    if (newAgent) {
      activities.push({
        leadId: id,
        type: "assignment",
        content: `Lead reassigned to ${newAgent.name}`,
      });
    }
  }
  if (body.budget !== undefined) updateData.budget = body.budget;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.name !== undefined) updateData.name = body.name;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.email !== undefined) updateData.email = body.email;

  const updated = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: { agent: true },
  });

  // Create activities
  for (const act of activities) {
    await prisma.activity.create({ data: act });
  }

  return NextResponse.json(updated);
}
