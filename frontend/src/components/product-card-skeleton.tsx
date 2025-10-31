import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <Skeleton className="h-56 w-full rounded-none" />
      <CardContent className="flex-1 flex flex-col p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-3" />

        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="flex-1">
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-12 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
