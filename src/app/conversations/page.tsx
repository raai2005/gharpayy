"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { MessageCircle } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Conversations" description="WhatsApp & messaging hub" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-64 text-center">
              <div>
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-sm">WhatsApp Integration</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect WhatsApp Business API to enable<br />direct messaging from the CRM.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-500">
                  <p className="font-medium">Integration Ready</p>
                  <p className="mt-1">Supports 360dialog, Twilio, and Meta Cloud API webhooks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Panel */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
