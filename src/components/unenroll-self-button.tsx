"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { unenrollSelfAction } from "@/lib/actions/enrollment";

interface Props {
  activityId: string;
  disabled?: boolean;
  className?: string;
}

export function UnenrollSelfButton({ activityId, disabled, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className={className}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setError("");
            setConfirming(true);
          }}
        >
          Desinscribirme
        </Button>
      </div>
    );
  }

  return (
    <div className={`max-w-[260px] space-y-2 ${className ?? ""}`}>
      <p className="text-xs text-text-secondary">
        ¿Seguro que deseas desinscribirte? Liberarás un cupo para otra persona.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setError("");
            setConfirming(false);
          }}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          loading={pending}
          disabled={disabled || pending}
          onClick={() => {
            setError("");
            startTransition(async () => {
              const r = await unenrollSelfAction(activityId);
              if (!r.success) {
                setError(r.error);
              } else {
                setConfirming(false);
                router.refresh();
              }
            });
          }}
        >
          Sí, desinscribirme
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-accent-red">{error}</p>
      ) : null}
    </div>
  );
}
