import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { type, content, agentId } = body;

  if (!type || !content) {
    return NextResponse.json({ error: "type and content required" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      leadId: id,
      agentId,
      type,
      content,
    },
    include: { agent: true },
  });

  // Update lead's last activity
  await prisma.lead.update({
    where: { id },
    data: { lastActivityAt: new Date() },
  });

  return NextResponse.json(activity, { status: 201 });
}
