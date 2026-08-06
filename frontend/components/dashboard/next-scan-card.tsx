import * as React from "react";
import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";

interface NextScanCardProps {
  nextRecommendedScanDate: string | null;
}

export function NextScanCard({ nextRecommendedScanDate }: NextScanCardProps) {
  const daysUntil = nextRecommendedScanDate
    ? differenceInCalendarDays(new Date(nextRecommendedScanDate), new Date())
    : null;

  const isDue = daysUntil !== null && daysUntil <= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next scan</p>
        {nextRecommendedScanDate ? (
          <>
            <p className="mt-2 font-display text-2xl font-medium">
              {isDue ? "Due now" : format(new Date(nextRecommendedScanDate), "EEEE, MMM d")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isDue ? "It's been a week since your last scan." : `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}
            </p>
          </>
        ) : (
          <p className="mt-2 font-display text-2xl font-medium">Start today</p>
        )}
        <Button asChild size="sm" className="mt-4 w-full gap-2">
          <Link href={ROUTES.newScan}>
            <Camera className="h-4 w-4" />
            {nextRecommendedScanDate ? "Take weekly scan" : "Start baseline scan"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
