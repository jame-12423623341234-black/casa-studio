import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { seedDemoFiles, getFiles, triggerDownload } from "@/lib/auth";

export const Route = createFileRoute("/download/$fileId")({
  head: () => ({
    meta: [{ title: "Download — Casa Studio" }],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const { fileId } = Route.useParams();
  const navigate = useNavigate();

  seedDemoFiles();
  const file = getFiles().find((f) => f.id === fileId);

  useEffect(() => {
    if (!file) {
      navigate({ to: "/" });
      return;
    }

    triggerDownload(file);
    const timer = window.setTimeout(() => {
      window.location.replace("/");
    }, 150);
    return () => window.clearTimeout(timer);
  }, [file, fileId, navigate]);

  return null;
}
