"use client";

import { useState, useEffect } from "react";
import { AgentCard } from "@/components/agents/agent-card";
import { SearchInput, FilterBar } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Agent {
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", description: "", owner: "", version: "" });
  const router = useRouter();

  const fetchAgents = () => {
    setLoading(true);
    const url = search ? `/api/agents?q=${encodeURIComponent(search)}` : "/api/agents";
    fetch(url)
      .then(r => r.json())
      .then(d => setAgents(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgents(); }, [search]);

  const filtered = statusFilter === "all" ? agents : agents.filter(a => a.status === statusFilter);

  const handleCreate = async () => {
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAgent),
    });
    setShowCreate(false);
    setNewAgent({ name: "", description: "", owner: "", version: "" });
    fetchAgents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Registry</h1>
          <p className="text-muted-foreground mt-1">Manage AI agent identities and trust profiles</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Register Agent
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput placeholder="Search agents..." value={search} onChange={setSearch} className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-full" />
              <div className="flex gap-1"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-20" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bot className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No agents found</p>
          <p className="text-sm">{search ? "Try a different search" : "Register your first agent to get started"}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} onClick={() => router.push(`/agents/${agent.id}`)} />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Agent</DialogTitle>
            <DialogDescription>Create a new AI agent identity in the registry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={newAgent.name} onChange={e => setNewAgent(p => ({ ...p, name: e.target.value }))} placeholder="e.g., MyAgent" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={newAgent.description} onChange={e => setNewAgent(p => ({ ...p, description: e.target.value }))} placeholder="What does this agent do?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner</label>
                <Input value={newAgent.owner} onChange={e => setNewAgent(p => ({ ...p, owner: e.target.value }))} placeholder="Team or person" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Version</label>
                <Input value={newAgent.version} onChange={e => setNewAgent(p => ({ ...p, version: e.target.value }))} placeholder="1.0.0" />
              </div>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!newAgent.name}>
              Register Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
