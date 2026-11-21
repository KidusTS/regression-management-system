"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, FlaskConical, LayoutDashboard, LogOut, Menu, Moon, PlayCircle, Sun, X, Layers } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/regression-packs", label: "Regression Packs", icon: Layers },
  { href: "/regression-sessions", label: "Sessions", icon: PlayCircle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
      <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
        <FlaskConical className="size-4" aria-hidden />
      </span>
      <span className="text-sidebar-accent-foreground font-semibold tracking-tight">Regression Hub</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Brand />
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("size-[18px]", active && "text-sidebar-primary")} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border space-y-2 border-t pt-4">
        <button
          onClick={toggle}
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          {theme === "dark" ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {user && (
          <div className="flex items-center gap-3 px-3 py-1">
            <span className="bg-sidebar-primary/20 text-sidebar-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-accent-foreground truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sidebar-foreground/60 truncate text-xs">{user.email}</p>
            </div>
            <button
              aria-label="Sign out"
              title="Sign out"
              onClick={() => { logout(); router.push("/login"); }}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2 transition-colors"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="bg-sidebar sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden">
        <Brand />
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="text-sidebar-foreground rounded-md p-2">
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="bg-sidebar text-sidebar-foreground relative h-full w-72 max-w-[85%]">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-sidebar-foreground absolute top-3 right-3 rounded-md p-2">
              <X className="size-5" aria-hidden />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
