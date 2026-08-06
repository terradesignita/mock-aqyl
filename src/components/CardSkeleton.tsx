import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-4 h-16 w-full rounded-lg" />
      <Skeleton className="mt-4 h-3 w-2/3" />
      <Skeleton className="mt-4 h-3 w-1/3" />
    </div>
  );
}
