"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollSelfAction } from "@/lib/actions/enrollment";

export function EnrollActivityButton({
  activityId,
  disabled,
  className,
}: {
  activityId: string;
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Button
        type="button"
        size="sm"
        loading={pending}
        disabled={disabled || pending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const r = await enrollSelfAction(activityId);
            if (!r.success) setError(r.error);
            else router.refresh();
          });
        }}
      >
        Inscribirme
      </Button>
      {error ? (
        <p className="max-w-[220px] text-xs text-accent-red">{error}</p>
      ) : null}
    </div>
  );
}
