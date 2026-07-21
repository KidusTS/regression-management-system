import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = { title: "Register — RMS" };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-muted-foreground text-sm">Fill in your details to get started</p>
      </div>
      <RegisterForm />
    </>
  );
}
