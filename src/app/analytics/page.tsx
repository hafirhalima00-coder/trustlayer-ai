import { AnalyticsGrid } from "@/components/analytics/analytics-grid";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights into agent trust and behavior</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Live Dashboard</span>
        </div>
      </div>
      <AnalyticsGrid />
    </div>
  );
}
