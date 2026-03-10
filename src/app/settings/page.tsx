"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Settings, Globe, MessageCircle, Webhook, Users, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration and integrations" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="h-4 w-4" /> Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="text-sm font-medium">Lead Capture Webhook</p>
              <code className="text-xs text-primary break-all block mt-1">
                POST /api/webhook/form
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Send leads from external forms (Google Forms via Zapier, Tally, etc.)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="text-sm font-medium">Expected Payload</p>
              <pre className="text-xs text-muted-foreground mt-1 font-mono">
{`{
  "name": "John Doe",
  "phone": "+919876543210",
  "source": "website",
  "budget": "8000-12000",
  "location": "Koramangala",
  "email": "john@email.com"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">360dialog API</span>
              <Badge variant="outline">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Twilio WhatsApp</span>
              <Badge variant="outline">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Meta Cloud API</span>
              <Badge variant="outline">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Follow-up Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Day 1 Follow-up</span>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Day 3 Follow-up</span>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Day 7 Follow-up</span>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">SLA Threshold</span>
              <Badge variant="outline">5 minutes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Assignment Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Assignment Method</span>
              <Badge className="bg-blue-500/20 text-blue-400">Round Robin (Workload)</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Auto-reassign on SLA breach</span>
              <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-sm">Admin Override</span>
              <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
