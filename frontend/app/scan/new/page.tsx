"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ScanCaptureForm } from "@/components/scan/scan-capture-form";
import { scanService } from "@/services/scan.service";
import { ApiClientError } from "@/lib/api-client";
import { MESSAGES } from "@/config/messages.config";
import { SCAN_TYPE } from "@/config/scan.config";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";

export default function NewScanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (file: File) => {
    setIsSubmitting(true);
    try {
      const scan = await scanService.create(file, SCAN_TYPE.WEEKLY);
      toast.success(MESSAGES.success.scanSaved);
      router.push(ROUTES.scanDetail(scan.id));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : MESSAGES.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="New Scan" description="Capture a new photo for objective, comparable skin analysis." />
      <ScanCaptureForm scanType={SCAN_TYPE.WEEKLY} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
    </AppShell>
  );
}
