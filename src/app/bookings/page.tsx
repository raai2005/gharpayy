"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Bookmark, IndianRupee, Clock, CheckCircle } from "lucide-react";

interface DashboardData {
  bookingsClosed: number;
  leadsByStatus: Record<string, number>;
}

export default function BookingsPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  const bookings = data?.bookingsClosed || 0;
  const pipeline = (data?.leadsByStatus?.["visit_completed"] || 0) + (data?.leadsByStatus?.["visit_scheduled"] || 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Manage bookings, payments, and revenue tracking" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20"><Bookmark className="h-5 w-5 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{bookings}</p><p className="text-xs text-muted-foreground">Total Bookings</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20"><Clock className="h-5 w-5 text-yellow-500" /></div>
            <div><p className="text-2xl font-bold">{pipeline}</p><p className="text-xs text-muted-foreground">Pipeline</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20"><CheckCircle className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-2xl font-bold">{bookings}</p><p className="text-xs text-muted-foreground">Confirmed</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20"><IndianRupee className="h-5 w-5 text-purple-500" /></div>
            <div><p className="text-2xl font-bold">₹{bookings * 10}k</p><p className="text-xs text-muted-foreground">Monthly Revenue</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Booking management with payment tracking will be available in the production release.</p>
          <p className="text-xs mt-2">Bookings are tracked through the pipeline when leads reach the "Booked" stage.</p>
        </CardContent>
      </Card>
    </div>
  );
}
