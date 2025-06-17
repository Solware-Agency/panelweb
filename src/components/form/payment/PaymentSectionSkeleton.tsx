import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PaymentSectionSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-1 w-20 mt-1 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <Skeleton className="h-7 w-40" />
          <div className="space-y-3">
             <Skeleton className="h-10 w-full" />
          </div>
           <Skeleton className="h-9 w-52" />
        </div>
      </CardContent>
    </Card>
  );
};