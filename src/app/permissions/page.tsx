"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionTable } from "@/components/permissions/permission-table";
import { SearchInput } from "@/components/shared/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Key } from "lucide-react";

interface Permission {
  id: string; agent_id: string; action: string; resource: string; effect: string; agent_name?: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [effectFilter, setEffectFilter] = useState("all");

  const fetchPermissions = () => {
    setLoading(true);
    fetch("/api/permissions")
      .then(r => r.json())
      .then(d => setPermissions(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPermissions(); }, []);

  const filtered = permissions.filter(p => {
    const matchesSearch = !search || p.action.includes(search) || p.resource.includes(search) || (p.agent_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesEffect = effectFilter === "all" || p.effect === effectFilter;
    return matchesSearch && matchesEffect;
  });

  const handleUpdateEffect = async (id: string, effect: string) => {
    await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, effect }),
    });
    fetchPermissions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Engine</h1>
          <p className="text-muted-foreground mt-1">Define and manage granular agent permissions</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput placeholder="Search by action, resource, or agent..." value={search} onChange={setSearch} className="flex-1" />
        <Select value={effectFilter} onValueChange={setEffectFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Effect" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Effects</SelectItem>
            <SelectItem value="ALLOW">ALLOW</SelectItem>
            <SelectItem value="DENY">DENY</SelectItem>
            <SelectItem value="REQUIRE_HUMAN_APPROVAL">HUMAN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">All Permissions</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{filtered.length} rules</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <PermissionTable permissions={filtered} onUpdateEffect={handleUpdateEffect} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
