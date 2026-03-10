import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Webhook endpoint for external lead capture
// Accepts leads from: Google Forms (via Zapier), Tally forms, WhatsApp Business API, etc.
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Normalize fields from various sources
  const name = body.name || body.full_name || body.customer_name || "";
  const phone = body.phone || body.phone_number || body.mobile || "";
  const email = body.email || body.email_address || "";
  const source = body.source || body.lead_source || "website";
  const budget = body.budget || body.budget_range || "";
  const location = body.location || body.preferred_location || body.area || "";
  const notes = body.notes || body.message || body.requirements || "";

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name and phone are required" },
      { status: 400 }
    );
  }

  // Check for duplicate by phone number (within last 24h)
  const existingLead = await prisma.lead.findFirst({
    where: {
      phone,
      createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  if (existingLead) {
    return NextResponse.json(
      { message: "Duplicate lead detected", leadId: existingLead.id },
      { status: 200 }
    );
  }

  // Round-robin assignment
  const agents = await prisma.agent.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          leads: { where: { status: { notIn: ["booked", "lost"] } } },
        },
      },
    },
  });

  agents.sort((a, b) => a._count.leads - b._count.leads);
  const assignedAgent = agents[0];

  if (!assignedAgent) {
    return NextResponse.json({ error: "No agents available" }, { status: 500 });
  }

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
  });

  // Log activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: "assignment",
      content: `Lead captured via webhook (${source}). Auto-assigned to ${assignedAgent.name}`,
    },
  });

  // Day 1 follow-up
  const day1 = new Date();
  day1.setDate(day1.getDate() + 1);
  await prisma.followUp.create({
    data: { leadId: lead.id, type: "day1", dueAt: day1 },
  });

  return NextResponse.json(
    { message: "Lead captured successfully", leadId: lead.id, assignedTo: assignedAgent.name },
    { status: 201 }
  );
}
