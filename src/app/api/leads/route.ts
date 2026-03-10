import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const agentId = searchParams.get("agentId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (agentId) where.agentId = agentId;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { location: { contains: search } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { agent: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, source, budget, location, notes } = body;

  if (!name || !phone || !source) {
    return NextResponse.json({ error: "name, phone, and source are required" }, { status: 400 });
  }

  // Round-robin assignment: pick agent with fewest active leads
  const agents = await prisma.agent.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          leads: {
            where: { status: { notIn: ["booked", "lost"] } },
          },
        },
      },
    },
  });

  if (agents.length === 0) {
    return NextResponse.json({ error: "No active agents available" }, { status: 500 });
  }

  // Sort by active lead count ascending
  agents.sort((a, b) => a._count.leads - b._count.leads);
  const assignedAgent = agents[0];

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      source,
      budget,
      location,
      notes,
      agentId: assignedAgent.id,
      status: "new_lead",
      score: 15,
      lastActivityAt: new Date(),
    },
    include: { agent: true },
  });

  // Log assignment activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: "assignment",
      content: `Lead auto-assigned to ${assignedAgent.name} (round-robin, lowest load: ${assignedAgent._count.leads} active leads)`,
    },
  });

  // Create Day 1 follow-up
  const day1 = new Date();
  day1.setDate(day1.getDate() + 1);
  await prisma.followUp.create({
    data: { leadId: lead.id, type: "day1", dueAt: day1 },
  });

  return NextResponse.json(lead, { status: 201 });
}
