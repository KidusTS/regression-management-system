export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="bg-background w-full max-w-sm rounded-xl border p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
