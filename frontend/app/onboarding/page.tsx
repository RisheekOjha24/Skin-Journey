"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { ScanCaptureForm } from "@/components/scan/scan-capture-form";
import { useAuth } from "@/lib/auth-context";
import { scanService } from "@/services/scan.service";
import { authService } from "@/services/auth.service";
import { ApiClientError } from "@/lib/api-client";
import { ROUTES } from "@/config/routes.config";
import { MESSAGES } from "@/config/messages.config";
import { SCAN_TYPE } from "@/config/scan.config";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) router.replace(ROUTES.login);
    if (!isLoading && user?.onboardingCompleted) router.replace(ROUTES.dashboard);
  }, [isLoading, user, router]);

  const handleSubmit = async (file: File) => {
    setIsSubmitting(true);
    try {
      await scanService.create(file, SCAN_TYPE.BASELINE);
      await authService.completeOnboarding();
      await refreshUser();
      toast.success(MESSAGES.success.scanSaved);
      router.push(ROUTES.dashboard);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : MESSAGES.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-medium">Let's set your baseline</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This first scan becomes the starting point for your entire skincare journey — every future scan is
            measured against it.
          </p>
        </div>
        <ScanCaptureForm scanType={SCAN_TYPE.BASELINE} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
