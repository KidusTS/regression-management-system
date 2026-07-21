"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/regression-packs", label: "Regression Packs" },
  { href: "/regression-sessions", label: "Sessions" },
  { href: "/reports", label: "Reports" },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            RMS
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith(link.href) && "text-foreground bg-muted font-medium"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-muted-foreground text-sm">
              {user.firstName} {user.lastName}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
