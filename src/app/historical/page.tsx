"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Upload, Search, Filter, History } from "lucide-react";

export default function HistoricalPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Historical Leads" description="Import and re-engage past leads" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Historical Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Import CSV or Excel file</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload historical leads from spreadsheets. Expected columns: Name, Phone, Email, Location, Budget, Source, Date.
              </p>
              <Button className="mt-4" variant="outline">
                <Upload className="h-4 w-4 mr-1" />Choose File
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" /> Segment & Re-engage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/30 text-sm">
              <p className="font-medium">By Location</p>
              <p className="text-xs text-muted-foreground">Filter by preferred area</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30 text-sm">
              <p className="font-medium">By Budget</p>
              <p className="text-xs text-muted-foreground">Filter by budget range</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30 text-sm">
              <p className="font-medium">By Last Contact</p>
              <p className="text-xs text-muted-foreground">Filter by last interaction date</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30 text-sm">
              <p className="font-medium">By Source</p>
              <p className="text-xs text-muted-foreground">Filter by original lead source</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
