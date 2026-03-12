"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { useState } from "react";

interface SidebarProfile {
  nombre: string;
  apellido: string;
  email: string;
}

interface SidebarProps {
  profile: SidebarProfile;
}

const navItems = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/voluntarios", label: "Voluntarios", icon: Users },
  { href: "/actividades", label: "Actividades", icon: CalendarDays },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    (profile.nombre?.[0] || "") + (profile.apellido?.[0] || "") ||
    profile.email[0].toUpperCase();

  async function handleLogout() {
    await logoutAction();
  }

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center gap-3">
        <Image
          src="/logo-white.png"
          alt="Fundación Grítalo"
          width={36}
          height={36}
          priority
        />
        <div>
          <p className="text-primary-200 text-xs">Fundación</p>
          <p className="font-bold text-text-inverse text-sm leading-tight">
            Grítalo
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface/10 text-text-inverse"
                  : "text-primary-200 hover:bg-surface/20 hover:text-text-inverse",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-green flex items-center justify-center text-text-inverse text-sm font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-inverse truncate">
              {profile.nombre} {profile.apellido}
            </p>
            <p className="text-xs text-primary-200">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-primary-200 hover:text-text-inverse transition-colors w-full cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary-500 text-text-inverse p-2 rounded-lg shadow-lg cursor-pointer"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-primary-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary-500 flex flex-col transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-4 right-4 text-text-inverse/70 hover:text-text-inverse cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-primary-500 flex-col fixed inset-y-0 left-0">
        {sidebarContent}
      </aside>
    </>
  );
}
