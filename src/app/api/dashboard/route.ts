import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalLeads,
    leadsByStatus,
    leadsBySource,
    visitsScheduled,
    bookingsClosed,
    agents,
    recentLeads,
    pendingFollowUps,
    slaBreaches,
  ] = await Promise.all([
    prisma.lead.count(),

    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    prisma.lead.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),

    prisma.visit.count({
      where: { status: { in: ["scheduled", "confirmed"] } },
    }),

    prisma.lead.count({ where: { status: "booked" } }),

    prisma.agent.findMany({
      where: { isActive: true },
      include: {
        leads: {
          select: { id: true, status: true, createdAt: true, firstResponseAt: true },
        },
      },
    }),

    prisma.lead.findMany({
      where: {
        status: { notIn: ["booked", "lost"] },
        lastActivityAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: { agent: true },
      orderBy: { lastActivityAt: "asc" },
      take: 10,
    }),

    prisma.followUp.count({
      where: {
        completedAt: null,
        dueAt: { lte: new Date() },
      },
    }),

    // SLA breaches: leads where first response > 5 min or no response yet and > 5 min old
    prisma.lead.count({
      where: {
        OR: [
          {
            firstResponseAt: null,
            createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
            status: "new_lead",
          },
        ],
      },
    }),
  ]);

  // Compute avg response time
  const respondedLeads = agents.flatMap((a) =>
    a.leads.filter((l) => l.firstResponseAt)
  );
  const avgResponseMs = respondedLeads.length > 0
    ? respondedLeads.reduce((sum, l) => {
        return sum + (new Date(l.firstResponseAt!).getTime() - new Date(l.createdAt).getTime());
      }, 0) / respondedLeads.length
    : 0;
  const avgResponseMin = Math.round(avgResponseMs / 60000 * 10) / 10;

  // Conversion rate
  const conversionRate = totalLeads > 0
    ? Math.round((bookingsClosed / totalLeads) * 1000) / 10
    : 0;

  // SLA compliance
  const totalWithResponse = respondedLeads.length;
  const withinSLA = respondedLeads.filter((l) => {
    const responseTime = new Date(l.firstResponseAt!).getTime() - new Date(l.createdAt).getTime();
    return responseTime <= 5 * 60 * 1000;
  }).length;
  const slaCompliance = totalWithResponse > 0
    ? Math.round((withinSLA / totalWithResponse) * 100)
    : 100;

  // Agent performance
  const agentPerformance = agents.map((agent) => {
    const activeLeads = agent.leads.filter((l) => !["booked", "lost"].includes(l.status)).length;
    const bookedLeads = agent.leads.filter((l) => l.status === "booked").length;
    const responded = agent.leads.filter((l) => l.firstResponseAt);
    const avgResp = responded.length > 0
      ? Math.round(
          responded.reduce((s, l) => s + (new Date(l.firstResponseAt!).getTime() - new Date(l.createdAt).getTime()), 0) / responded.length / 60000 * 10
        ) / 10
      : 0;
    const conversion = agent.leads.length > 0
      ? Math.round((bookedLeads / agent.leads.length) * 100)
      : 0;

    return {
      id: agent.id,
      name: agent.name,
      activeLeads,
      bookedLeads,
      totalLeads: agent.leads.length,
      avgResponseTime: avgResp,
      conversion,
    };
  });

  // Hot leads (score >= 70)
  const hotLeads = await prisma.lead.findMany({
    where: { score: { gte: 70 }, status: { notIn: ["booked", "lost"] } },
    include: { agent: true },
    orderBy: { score: "desc" },
    take: 5,
  });

  // New today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const newToday = await prisma.lead.count({
    where: { createdAt: { gte: startOfDay } },
  });

  return NextResponse.json({
    totalLeads,
    leadsByStatus: Object.fromEntries(leadsByStatus.map((s) => [s.status, s._count._all])),
    leadsBySource: Object.fromEntries(leadsBySource.map((s) => [s.source, s._count._all])),
    visitsScheduled,
    bookingsClosed,
    avgResponseMin,
    conversionRate,
    slaCompliance,
    slaBreaches,
    agentPerformance,
    needsAttention: recentLeads,
    hotLeads,
    pendingFollowUps,
    newToday,
  });
}
