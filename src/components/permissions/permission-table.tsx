"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Permission {
  id: string;
  agent_id: string;
  action: string;
  resource: string;
  effect: string;
  agent_name?: string;
}

interface PermissionTableProps {
  permissions: Permission[];
  onUpdateEffect?: (id: string, effect: string) => void;
}

export function PermissionTable({ permissions, onUpdateEffect }: PermissionTableProps) {
  const getEffectBadge = (effect: string) => {
    switch (effect) {
      case "ALLOW": return <Badge variant="success"><Shield className="h-3 w-3 mr-1" />ALLOW</Badge>;
      case "DENY": return <Badge variant="danger"><ShieldOff className="h-3 w-3 mr-1" />DENY</Badge>;
      case "REQUIRE_HUMAN_APPROVAL": return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />HUMAN</Badge>;
      default: return <Badge>{effect}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {permissions[0]?.agent_name && <TableHead>Agent</TableHead>}
          <TableHead>Action</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>Effect</TableHead>
          {onUpdateEffect && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((perm) => (
          <TableRow key={perm.id}>
            {perm.agent_name && <TableCell className="font-medium">{perm.agent_name}</TableCell>}
            <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{perm.action}</code></TableCell>
            <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{perm.resource}</code></TableCell>
            <TableCell>{getEffectBadge(perm.effect)}</TableCell>
            {onUpdateEffect && (
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onUpdateEffect(perm.id, "ALLOW")}>Allow</Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onUpdateEffect(perm.id, "DENY")}>Deny</Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onUpdateEffect(perm.id, "REQUIRE_HUMAN_APPROVAL")}>Human</Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {permissions.length === 0 && (
          <TableRow>
            <TableCell colSpan={onUpdateEffect ? 5 : 4} className="text-center text-muted-foreground py-8">
              No permissions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
