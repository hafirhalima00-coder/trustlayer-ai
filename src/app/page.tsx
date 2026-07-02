import { AnalyticsGrid } from "@/components/analytics/analytics-grid";
import { Shield } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">TrustLayer AI — Agent Trust & Identity Platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Trust Engine Active</span>
        </div>
      </div>
      <AnalyticsGrid />
    </div>
  );
}
