"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

interface AuditLog {
  id: string;
  agent_name?: string;
  agent_id: string;
  action: string;
  resource: string;
  outcome: string;
  confidence: number;
  reason: string;
  details: string | null;
  created_at: string;
}

interface AuditTableProps {
  logs: AuditLog[];
  onExport?: () => void;
}

export function AuditTable({ logs, onExport }: AuditTableProps) {
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "ALLOW": return <Badge variant="success">ALLOW</Badge>;
      case "DENY": return <Badge variant="danger">DENY</Badge>;
      case "REQUIRE_HUMAN_APPROVAL": return <Badge variant="warning">HUMAN</Badge>;
      default: return <Badge>{outcome}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{logs.length} audit records</p>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell className="font-medium text-sm">{log.agent_name || log.agent_id.slice(0, 8)}</TableCell>
                <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{log.action}</code></TableCell>
                <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{log.resource}</code></TableCell>
                <TableCell>{getOutcomeBadge(log.outcome)}</TableCell>
                <TableCell>{(log.confidence * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.reason}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No audit records</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
