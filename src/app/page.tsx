"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, ShieldAlert, Key, Scale, Bot, ArrowRight, Lock, FileText, Eye } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TrustLayer AI</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            A trust and identity platform for autonomous AI agents. Every agent has a DID-anchored identity,
            verifiable credentials, and a transparent trust profile. Trust decisions are cryptographically signed and fully explainable.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline"><Lock className="h-3 w-3 mr-1" /> ECDSA P-256 Signatures</Badge>
            <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> W3C Verifiable Credentials</Badge>
            <Badge variant="outline"><Shield className="h-3 w-3 mr-1" /> DID-based Identity</Badge>
            <Badge variant="outline"><Scale className="h-3 w-3 mr-1" /> 5-Factor Trust Evaluation</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/trust-negotiation">
          <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">Trust Negotiation</CardTitle>
                  <CardDescription>Cross-agent demo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Watch two agents negotiate trust in real-time. Agent A presents DID credentials,
                Agent B verifies cryptographic signatures, and the trust engine renders a signed decision.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                Try Demo <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attack-simulator">
          <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-red-500/50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-base group-hover:text-red-500 transition-colors">Attack Simulator</CardTitle>
                  <CardDescription>Failure test scenarios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See how TrustLayer catches malicious agents: identity spoofing, revoked credentials,
                expired tokens, tampered claims, and replay attacks — all blocked.
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm text-red-500 font-medium">
                Run Attacks <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/trust-decision">
          <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Scale className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">Trust Engine</CardTitle>
                  <CardDescription>5-factor evaluation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interactive evaluation of identity (15%), permissions (25%), reputation (25%),
                policy compliance (20%), and risk assessment (15%).
              </p>
              <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                Evaluate <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/agents">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Agents</p>
                <p className="text-xs text-muted-foreground">Registry</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/permissions">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Permissions</p>
                <p className="text-xs text-muted-foreground">Engine</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reputation">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Reputation</p>
                <p className="text-xs text-muted-foreground">System</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/credentials">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Credentials</p>
                <p className="text-xs text-muted-foreground">Verifiable</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/audit">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Audit</p>
                <p className="text-xs text-muted-foreground">Center</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
