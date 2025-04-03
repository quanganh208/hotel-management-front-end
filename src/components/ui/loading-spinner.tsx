"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export default function LoadingSpinner({
  className,
  size = 24,
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Loader2
        className={cn("animate-spin text-primary", className)}
        size={size}
      />
    </div>
  );
}
