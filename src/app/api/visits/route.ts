import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const visits = await prisma.visit.findMany({
    include: {
      lead: true,
      property: true,
      agent: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json(visits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { leadId, propertyId, agentId, scheduledAt } = body;

  if (!leadId || !propertyId || !agentId || !scheduledAt) {
    return NextResponse.json({ error: "leadId, propertyId, agentId, scheduledAt required" }, { status: 400 });
  }

  const visit = await prisma.visit.create({
    data: {
      leadId,
      propertyId,
      agentId,
      scheduledAt: new Date(scheduledAt),
      status: "scheduled",
    },
    include: { lead: true, property: true, agent: true },
  });

  // Update lead status to visit_scheduled
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "visit_scheduled", score: 85, lastActivityAt: new Date() },
  });

  // Log activity
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  await prisma.activity.create({
    data: {
      leadId,
      agentId,
      type: "visit",
      content: `Visit scheduled at ${property?.name} - ${property?.location}`,
    },
  });

  return NextResponse.json(visit, { status: 201 });
}
