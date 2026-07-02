"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PermissionTable } from "@/components/permissions/permission-table";
import { TrustScoreCard, ReputationTimeline } from "@/components/reputation/trust-score-card";
import { CredentialCard } from "@/components/credentials/credential-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Bot, Shield, Key, Award, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentDetail {
  id: string;
  name: string;
  description: string;
  owner: string;
  version: string;
  status: string;
  capabilities: string[];
  trust_score: number;
  created_at: string;
}

interface Permission {
  id: string; agent_id: string; action: string; resource: string; effect: string;
}

interface ReputationEvent {
  event_type: string; score_delta: number; description: string; created_at: string;
}

interface Credential {
  id: string; type: string; issuer: string; status: string; issued_at: string; expires_at: string | null; verified_at: string | null;
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/agents/${id}`).then(r => r.json()),
      fetch(`/api/permissions/${id}`).then(r => r.json()),
      fetch(`/api/reputation/${id}`).then(r => r.json()),
      fetch(`/api/credentials?agent_id=${id}`).then(r => r.json()).catch(() => []),
    ]).then(([agentData, perms, repData, creds]) => {
      setAgent(agentData);
      setPermissions(perms);
      setReputationEvents(repData.events || []);
      setCredentials(creds.filter((c: any) => c.agent_id === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async (credId: string) => {
    await fetch(`/api/credentials/${credId}/verify`, { method: "POST" });
    const creds = await fetch(`/api/credentials`).then(r => r.json());
    setCredentials(creds.filter((c: any) => c.agent_id === id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-40 col-span-2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!agent) return <div>Agent not found</div>;

  const initials = agent.name.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/agents")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <div className={cn("h-2 w-2 rounded-full", agent.status === "active" ? "bg-emerald-500" : "bg-gray-500")} />
              <Badge variant={agent.status === "active" ? "success" : "secondary"}>{agent.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Owner</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{agent.owner}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Version</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">v{agent.version}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Created</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{new Date(agent.created_at).toLocaleDateString()}</p></CardContent></Card>
        <TrustScoreCard agentName={agent.name} score={agent.trust_score} />
      </div>

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions"><Key className="h-4 w-4 mr-2" />Permissions</TabsTrigger>
          <TabsTrigger value="reputation"><Award className="h-4 w-4 mr-2" />Reputation</TabsTrigger>
          <TabsTrigger value="credentials"><FileText className="h-4 w-4 mr-2" />Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Agent Permissions</CardTitle></CardHeader>
            <CardContent>
              <PermissionTable permissions={permissions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reputation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Reputation Timeline</CardTitle></CardHeader>
            <CardContent>
              <ReputationTimeline events={reputationEvents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map(cred => (
              <CredentialCard key={cred.id} credential={cred} onVerify={handleVerify} />
            ))}
            {credentials.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No credentials assigned</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
