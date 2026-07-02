"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from "recharts";

const COLORS = {
  emerald: "#10b981",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  gray: "#6b7280",
};

const PIE_COLORS = ["#10b981", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

export function TrustDistributionChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Trust Score Distribution</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PolicyViolationsChart({ total }: { total: number }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Policy Violations</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-red-500">{total}</div>
          <div className="text-sm text-muted-foreground">total violations recorded</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, total * 10)}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskLevelsChart({ data }: { data: { level: string; count: number }[] }) {
  const riskColors: Record<string, string> = { low: COLORS.emerald, medium: COLORS.yellow, high: COLORS.orange, critical: COLORS.red };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Risk Levels</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => <Cell key={i} fill={riskColors[entry.level] || COLORS.gray} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReputationTrendsChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Reputation Trends (14 days)</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke={COLORS.emerald} fill="url(#scoreGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalStatsChart({ data }: { data: { date: string; allow: number; deny: number; human: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Decision Timeline (7 days)</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="allow" name="ALLOW" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="deny" name="DENY" fill={COLORS.red} radius={[4, 4, 0, 0]} />
              <Bar dataKey="human" name="HUMAN" fill={COLORS.yellow} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
