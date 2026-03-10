import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Return follow-ups that are due and not completed
  const followUps = await prisma.followUp.findMany({
    where: {
      completedAt: null,
      dueAt: { lte: new Date() },
    },
    include: {
      lead: {
        include: { agent: true },
      },
    },
    orderBy: { dueAt: "asc" },
  });

  return NextResponse.json(followUps);
}
