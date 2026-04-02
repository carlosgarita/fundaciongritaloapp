"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollSelfAction } from "@/lib/actions/enrollment";

export function EnrollActivityButton({
  activityId,
  disabled,
}: {
  activityId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="space-y-1">
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
        <p className="text-xs text-accent-red max-w-[200px]">{error}</p>
      ) : null}
    </div>
  );
}
