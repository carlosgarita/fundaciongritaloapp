"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, AlertTriangle, Search } from "lucide-react";
import { changeRoleAction } from "@/lib/actions/volunteer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: "admin" | "voluntario";
  estado: string;
  isProtected?: boolean;
  avatarUrl?: string | null;
}

interface AdminManagerProps {
  users: User[];
}

export function AdminManager({ users: initialUsers }: AdminManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"promote" | "demote" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const admins = users.filter((u) => u.role === "admin");
  const volunteers = users
    .filter((u) => u.role === "voluntario" && u.estado !== "inactivo")
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });

  function requestChange(userId: string, action: "promote" | "demote") {
    setError("");
    setSuccess("");
    setConfirmId(userId);
    setConfirmAction(action);
  }

  function cancelConfirm() {
    setConfirmId(null);
    setConfirmAction(null);
  }

  function executeChange() {
    if (!confirmId || !confirmAction) return;
    const newRole = confirmAction === "promote" ? "admin" : "voluntario";

    startTransition(async () => {
      const result = await changeRoleAction({ userId: confirmId, role: newRole });

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === confirmId ? { ...u, role: newRole } : u)),
        );
        const user = users.find((u) => u.id === confirmId);
        setSuccess(
          confirmAction === "promote"
            ? `${user?.nombre} ${user?.apellido} ahora es administrador.`
            : `${user?.nombre} ${user?.apellido} ya no es administrador.`,
        );
      } else {
        setError(result.error);
      }

      setConfirmId(null);
      setConfirmAction(null);
    });
  }

  const confirmUser = confirmId ? users.find((u) => u.id === confirmId) : null;

  return (
    <div className="space-y-6">
      {/* Current Admins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-text-primary">
              Administradores actuales
            </h2>
            <span className="ml-auto text-sm text-text-muted">
              {admins.length} {admins.length === 1 ? "admin" : "admins"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-accent-red">
              {error}
            </div>
          )}
          <div className="divide-y divide-border">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    nombre={admin.nombre}
                    apellido={admin.apellido}
                    email={admin.email}
                    avatarUrl={admin.avatarUrl}
                    className="h-10 w-10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {admin.nombre} {admin.apellido}
                    </p>
                    <p className="text-xs text-text-muted truncate">{admin.email}</p>
                  </div>
                </div>
                {admin.isProtected ? (
                  <span className="text-xs text-text-muted bg-surface-hover px-2.5 py-1 rounded-full">
                    Admin principal
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestChange(admin.id, "demote")}
                    disabled={isPending}
                    className="text-text-muted hover:text-accent-red"
                  >
                    <ShieldOff className="h-4 w-4 mr-1.5" />
                    Quitar rol
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promote Volunteer */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text-primary">
            Promover voluntario a administrador
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Selecciona un voluntario activo para otorgarle permisos de
            administración.
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {volunteers.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">
              {search ? "Sin resultados." : "No hay voluntarios disponibles."}
            </p>
          ) : (
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      nombre={vol.nombre}
                      apellido={vol.apellido}
                      email={vol.email}
                      avatarUrl={vol.avatarUrl}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {vol.nombre} {vol.apellido}
                      </p>
                      <p className="text-xs text-text-muted truncate">{vol.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => requestChange(vol.id, "promote")}
                    disabled={isPending}
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Hacer admin
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {confirmId && confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  confirmAction === "promote"
                    ? "bg-primary-50"
                    : "bg-red-50",
                )}
              >
                {confirmAction === "promote" ? (
                  <Shield className="h-5 w-5 text-primary-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-accent-red" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                {confirmAction === "promote"
                  ? "Confirmar promoción"
                  : "Confirmar degradación"}
              </h3>
            </div>

            <p className="text-sm text-text-secondary mb-6">
              {confirmAction === "promote" ? (
                <>
                  ¿Estás seguro de que quieres hacer a{" "}
                  <strong>
                    {confirmUser.nombre} {confirmUser.apellido}
                  </strong>{" "}
                  administrador? Tendrá acceso completo al sistema.
                </>
              ) : (
                <>
                  ¿Estás seguro de que quieres quitar el rol de administrador a{" "}
                  <strong>
                    {confirmUser.nombre} {confirmUser.apellido}
                  </strong>
                  ? Pasará a ser voluntario y perderá acceso al panel de
                  administración.
                </>
              )}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button variant="outline" onClick={cancelConfirm} disabled={isPending} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                variant={confirmAction === "promote" ? "primary" : "danger"}
                onClick={executeChange}
                loading={isPending}
                className="w-full sm:w-auto"
              >
                {confirmAction === "promote"
                  ? "Sí, hacer administrador"
                  : "Sí, quitar rol"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
