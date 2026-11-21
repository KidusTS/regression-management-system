"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) router.replace("/login");
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="animate-in-up mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:ml-64 lg:max-w-none lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
