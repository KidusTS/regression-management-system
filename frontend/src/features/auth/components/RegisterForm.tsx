"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schemas";
import { useRegister } from "../hooks/useRegister";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const { mutate: register_, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const errorMessage = error instanceof Error ? error.message : error ? "Registration failed" : null;

  return (
    <form onSubmit={handleSubmit((data) => register_(data))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">First name</label>
          <Input placeholder="John" {...register("firstName")} />
          {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Last name</label>
          <Input placeholder="Doe" {...register("lastName")} />
          {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
        </div>
      </div>

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
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
