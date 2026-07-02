"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { TrustDistributionChart, PolicyViolationsChart, RiskLevelsChart, ReputationTrendsChart, ApprovalStatsChart } from "./analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Shield, Scale, AlertTriangle } from "lucide-react";
import { formatNumber, formatPercentage } from "@/lib/utils";

export function AnalyticsGrid() {
  const { data, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[250px] w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const statsCards = [
    { title: "Total Agents", value: data.total_agents.toString(), icon: Bot, color: "text-blue-500" },
    { title: "Active Agents", value: data.active_agents.toString(), icon: Shield, color: "text-emerald-500" },
    { title: "Avg Trust Score", value: data.avg_trust_score.toFixed(0), icon: Scale, color: "text-purple-500" },
    { title: "Violations", value: data.total_violations.toString(), icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrustDistributionChart data={data.trust_distribution} />
        <RiskLevelsChart data={data.risk_distribution} />
        <ReputationTrendsChart data={data.reputation_trends} />
        <ApprovalStatsChart data={data.approval_stats} />
      </div>
    </div>
  );
}
