import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

neonConfig.useSecureWebSocket = true;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) });

async function main() {
  // Create Agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: { name: "Priya Sharma", email: "priya@gharpayy.com", phone: "+919876500001" },
    }),
    prisma.agent.create({
      data: { name: "Rahul Verma", email: "rahul@gharpayy.com", phone: "+919876500002" },
    }),
    prisma.agent.create({
      data: { name: "Anita Desai", email: "anita@gharpayy.com", phone: "+919876500003" },
    }),
    prisma.agent.create({
      data: { name: "Vikram Singh", email: "vikram@gharpayy.com", phone: "+919876500004" },
    }),
  ]);

  // Create Properties
  const properties = await Promise.all([
    prisma.property.create({
      data: { name: "Gharpayy Residency", location: "Koramangala", price: 10000, amenities: "WiFi, AC, Laundry, Meals" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Villa", location: "Whitefield", price: 12000, amenities: "WiFi, AC, Gym, Parking" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Heights", location: "Marathahalli", price: 8500, amenities: "WiFi, Laundry, Meals" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Prime", location: "HSR Layout", price: 11000, amenities: "WiFi, AC, Gym, Meals" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Nest", location: "Indiranagar", price: 14000, amenities: "WiFi, AC, Laundry, Gym, Meals, Parking" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Studio", location: "BTM Layout", price: 7500, amenities: "WiFi, Laundry" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Tower", location: "Electronic City", price: 9000, amenities: "WiFi, AC, Meals, Shuttle" },
    }),
    prisma.property.create({
      data: { name: "Gharpayy Park", location: "JP Nagar", price: 9500, amenities: "WiFi, AC, Laundry, Meals" },
    }),
  ]);

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  // Create Leads across all pipeline stages
  const leadsData = [
    // New Leads
    { name: "Aarav Patel", phone: "+919876543210", source: "whatsapp", status: "new_lead", score: 15, budget: "8000-12000", location: "Koramangala", agentId: agents[0].id, createdAt: hoursAgo(2) },
    { name: "Amit Saxena", phone: "+918761234567", source: "phone_call", status: "new_lead", score: 15, budget: "7500-10000", location: "HSR Layout", agentId: agents[1].id, createdAt: hoursAgo(4) },
    { name: "Nikhil Agarwal", phone: "+911098765432", source: "whatsapp", status: "new_lead", score: 15, budget: "8500-12000", location: "JP Nagar", agentId: agents[2].id, createdAt: hoursAgo(6) },
    // Contacted
    { name: "Sneha Reddy", phone: "+918765432109", source: "website", status: "contacted", score: 35, budget: "10000-15000", location: "HSR Layout", agentId: agents[1].id, firstResponseAt: daysAgo(1), createdAt: daysAgo(2) },
    { name: "Riya Chatterjee", phone: "+919871234567", source: "instagram", status: "contacted", score: 35, budget: "9000-11000", location: "Koramangala", agentId: agents[0].id, firstResponseAt: daysAgo(1), createdAt: daysAgo(2) },
    // Requirement Collected
    { name: "Karan Mehta", phone: "+917654321098", source: "instagram", status: "requirement_collected", score: 50, budget: "7000-10000", location: "BTM Layout", agentId: agents[2].id, firstResponseAt: daysAgo(4), createdAt: daysAgo(5) },
    { name: "Tanvi Shah", phone: "+917651234567", source: "landing_page", status: "requirement_collected", score: 50, budget: "13000-18000", location: "Indiranagar", agentId: agents[3].id, firstResponseAt: daysAgo(3), createdAt: daysAgo(4) },
    // Property Suggested
    { name: "Divya Nair", phone: "+916543210987", source: "facebook", status: "property_suggested", score: 70, budget: "12000-18000", location: "Indiranagar", agentId: agents[0].id, firstResponseAt: daysAgo(6), createdAt: daysAgo(7) },
    { name: "Kavita Rao", phone: "+915431234567", source: "facebook", status: "property_suggested", score: 65, budget: "8000-11000", location: "BTM Layout", agentId: agents[0].id, firstResponseAt: daysAgo(5), createdAt: daysAgo(6) },
    // Visit Scheduled
    { name: "Suresh Iyer", phone: "+916541234567", source: "website", status: "visit_scheduled", score: 85, budget: "10000-15000", location: "Whitefield", agentId: agents[2].id, firstResponseAt: daysAgo(5), createdAt: daysAgo(6) },
    { name: "Rohit Kumar", phone: "+915432109876", source: "phone_call", status: "visit_scheduled", score: 85, budget: "9000-13000", location: "Marathahalli", agentId: agents[3].id, firstResponseAt: daysAgo(4), createdAt: daysAgo(5) },
    // Visit Completed
    { name: "Meera Joshi", phone: "+914321098765", source: "landing_page", status: "visit_completed", score: 100, budget: "11000-16000", location: "Whitefield", agentId: agents[2].id, firstResponseAt: daysAgo(8), createdAt: daysAgo(10) },
    // Booked
    { name: "Arjun Kapoor", phone: "+913210987654", source: "whatsapp", status: "booked", score: 100, budget: "10000-14000", location: "Electronic City", agentId: agents[1].id, firstResponseAt: daysAgo(12), createdAt: daysAgo(14) },
    // Lost
    { name: "Pooja Gupta", phone: "+912109876543", source: "website", status: "lost", score: 10, budget: "6000-8000", location: "Yelahanka", agentId: agents[3].id, firstResponseAt: daysAgo(9), lostReason: "Budget too low", createdAt: daysAgo(12) },
  ];

  const leads = [];
  for (const data of leadsData) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        lastActivityAt: data.firstResponseAt || data.createdAt,
        updatedAt: new Date(),
      },
    });
    leads.push(lead);
  }

  // Create Visits
  await prisma.visit.create({
    data: {
      leadId: leads[9].id, // Suresh - visit scheduled
      propertyId: properties[1].id, // Gharpayy Villa Whitefield
      agentId: agents[2].id,
      scheduledAt: daysFromNow(1),
      status: "confirmed",
      confirmedAt: hoursAgo(12),
    },
  });

  await prisma.visit.create({
    data: {
      leadId: leads[10].id, // Rohit - visit scheduled
      propertyId: properties[2].id, // Gharpayy Heights Marathahalli
      agentId: agents[3].id,
      scheduledAt: daysFromNow(2),
      status: "confirmed",
      confirmedAt: hoursAgo(6),
    },
  });

  await prisma.visit.create({
    data: {
      leadId: leads[7].id, // Divya - property suggested (upcoming)
      propertyId: properties[4].id, // Gharpayy Nest Indiranagar
      agentId: agents[0].id,
      scheduledAt: daysFromNow(3),
      status: "scheduled",
    },
  });

  await prisma.visit.create({
    data: {
      leadId: leads[11].id, // Meera - visit completed
      propertyId: properties[1].id, // Gharpayy Villa Whitefield
      agentId: agents[2].id,
      scheduledAt: daysAgo(3),
      confirmedAt: daysAgo(4),
      status: "completed",
      outcome: "considering",
    },
  });

  // Create Activities
  const activitiesData = [
    { leadId: leads[0].id, type: "assignment", content: "Lead auto-assigned to Priya Sharma (round-robin)", createdAt: hoursAgo(2) },
    { leadId: leads[1].id, type: "assignment", content: "Lead auto-assigned to Rahul Verma (round-robin)", createdAt: hoursAgo(4) },
    { leadId: leads[3].id, agentId: agents[1].id, type: "stage_change", content: "Status changed from New Lead to Contacted", createdAt: daysAgo(1) },
    { leadId: leads[3].id, agentId: agents[1].id, type: "message", content: "Hi Sneha! Welcome to Gharpayy. We have great PG options in HSR Layout. What's your preferred budget?", createdAt: daysAgo(1) },
    { leadId: leads[5].id, agentId: agents[2].id, type: "stage_change", content: "Status changed from Contacted to Requirement Collected", createdAt: daysAgo(3) },
    { leadId: leads[5].id, agentId: agents[2].id, type: "note", content: "Looking for single occupancy, prefers BTM Layout, budget 7-10k, needs WiFi and meals", createdAt: daysAgo(3) },
    { leadId: leads[7].id, agentId: agents[0].id, type: "stage_change", content: "Status changed from Requirement Collected to Property Suggested", createdAt: daysAgo(4) },
    { leadId: leads[7].id, agentId: agents[0].id, type: "message", content: "Hi Divya! Based on your requirements, I'd recommend Gharpayy Nest in Indiranagar. Would you like to schedule a visit?", createdAt: daysAgo(4) },
    { leadId: leads[9].id, agentId: agents[2].id, type: "visit", content: "Visit scheduled at Gharpayy Villa - Whitefield", createdAt: daysAgo(2) },
    { leadId: leads[11].id, agentId: agents[2].id, type: "visit", content: "Visit completed at Gharpayy Villa - Whitefield. Outcome: Considering", createdAt: daysAgo(3) },
    { leadId: leads[12].id, agentId: agents[1].id, type: "stage_change", content: "Status changed to Booked! 🎉", createdAt: daysAgo(7) },
    { leadId: leads[13].id, agentId: agents[3].id, type: "stage_change", content: "Status changed to Lost. Reason: Budget too low", createdAt: daysAgo(5) },
  ];

  for (const data of activitiesData) {
    await prisma.activity.create({ data });
  }

  // Create Follow-ups for inactive leads
  await prisma.followUp.create({
    data: { leadId: leads[0].id, type: "day1", dueAt: daysFromNow(1) },
  });
  await prisma.followUp.create({
    data: { leadId: leads[1].id, type: "day1", dueAt: hoursAgo(2) },
  });
  await prisma.followUp.create({
    data: { leadId: leads[2].id, type: "day1", dueAt: hoursAgo(1) },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   ${agents.length} agents`);
  console.log(`   ${properties.length} properties`);
  console.log(`   ${leads.length} leads`);
  console.log(`   ${activitiesData.length} activities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
