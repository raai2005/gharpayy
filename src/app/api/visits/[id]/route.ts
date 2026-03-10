import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const visit = await prisma.visit.findUnique({ where: { id }, include: { property: true } });
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.outcome) updateData.outcome = body.outcome;
  if (body.notes) updateData.notes = body.notes;
  if (body.status === "confirmed") updateData.confirmedAt = new Date();

  const updated = await prisma.visit.update({
    where: { id },
    data: updateData,
    include: { lead: true, property: true, agent: true },
  });

  // If visit completed, update lead status
  if (body.status === "completed" && body.outcome) {
    const newLeadStatus = body.outcome === "booked" ? "booked" : "visit_completed";
    const newScore = body.outcome === "booked" ? 100 : 100;
    await prisma.lead.update({
      where: { id: visit.leadId },
      data: { status: newLeadStatus, score: newScore, lastActivityAt: new Date() },
    });

    await prisma.activity.create({
      data: {
        leadId: visit.leadId,
        agentId: visit.agentId,
        type: "visit",
        content: `Visit completed at ${visit.property.name}. Outcome: ${body.outcome}`,
      },
    });
  }

  return NextResponse.json(updated);
}
