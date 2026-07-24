"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const errorMessage =
    error instanceof Error ? error.message : error ? "Invalid email or password" : null;

  return (
    <form onSubmit={handleSubmit((data) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      login(data);
    })} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Password</label>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Register
        </Link>
      </p>
    </form>
  );
}
