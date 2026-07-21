import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Sign in — RMS" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground text-sm">Enter your credentials to continue</p>
      </div>
      <LoginForm />
    </>
  );
}
