"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingPageProps {
  className?: string;
  size?: number;
  text?: string;
}

export default function LoadingPage({
  className,
  size = 32,
  text = "Đang tải...",
}: LoadingPageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <Loader2
        className={cn("animate-spin text-primary", className)}
        size={size}
      />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
