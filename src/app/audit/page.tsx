"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditTable } from "@/components/audit/audit-table";
import { SearchInput } from "@/components/shared/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Filter } from "lucide-react";

interface AuditLog {
  id: string; agent_name: string; agent_id: string; action: string; resource: string; outcome: string; confidence: number; reason: string; details: string | null; created_at: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (outcomeFilter !== "all") params.set("outcome", outcomeFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    return `/api/audit?${params.toString()}`;
  };

  const fetchLogs = () => {
    setLoading(true);
    fetch(buildUrl())
      .then(r => r.json())
      .then(data => {
        if (data && !data.total_agents) {
          setLogs(Array.isArray(data) ? data : []);
        } else if (data && data.recent_audits) {
          setLogs(data.recent_audits || []);
        } else {
          setLogs([]);
        }
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleExport = () => {
    const csv = [
      "Timestamp,Agent,Action,Resource,Outcome,Confidence,Reason",
      ...logs.map(l => `"${l.created_at}","${l.agent_name}","${l.action}","${l.resource}","${l.outcome}",${(l.confidence * 100).toFixed(0)}%,"${l.reason}"`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustlayer-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Center</h1>
          <p className="text-muted-foreground mt-1">Record of every trust decision and agent action</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <SearchInput placeholder="Search audit logs..." value={search} onChange={setSearch} className="flex-1 min-w-[200px]" />
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="ALLOW">ALLOW</SelectItem>
                <SelectItem value="DENY">DENY</SelectItem>
                <SelectItem value="REQUIRE_HUMAN_APPROVAL">HUMAN</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-[160px]" placeholder="From" />
            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-[160px]" placeholder="To" />
            <Button variant="secondary" onClick={fetchLogs}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Audit Records
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <AuditTable logs={logs} onExport={handleExport} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
