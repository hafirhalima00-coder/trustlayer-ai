import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
