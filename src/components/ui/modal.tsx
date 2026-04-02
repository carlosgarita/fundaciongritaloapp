"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4 bg-black/50 p-0"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-surface shadow-lg w-full flex flex-col min-h-0 animate-fade-in",
          /* Móvil: panel a pantalla completa (evita ventanas flotantes pequeñas y barras del navegador) */
          "max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:max-w-full",
          "sm:rounded-2xl sm:max-h-[min(90vh,900px)] sm:max-w-lg sm:overflow-hidden",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-2 shrink-0 border-b border-border sm:border-0">
          <h2 className="text-lg font-bold text-text-primary min-w-0 pr-2 leading-snug">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer shrink-0 touch-manipulation"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className={cn(
            "px-4 sm:px-6 overflow-y-auto overscroll-contain min-h-0 flex-1",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
