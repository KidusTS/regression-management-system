"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios from "axios";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/Field";

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const errorMessage = !error
    ? null
    : axios.isAxiosError(error) && !error.response
      ? "Can't reach the server. Please Try again later."
      : "Invalid email or password";

  return (
    <form
      onSubmit={handleSubmit((data) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        login(data);
      })}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to manage your regression packs and sessions.
        </p>
      </div>

      <Field label="Email" error={errors.email?.message}>
        {(id) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        )}
      </Field>
      <Field label="Password" error={errors.password?.message}>
        {(id) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        )}
      </Field>

      {errorMessage && (
        <p
          role="alert"
          className="bg-danger-soft text-danger rounded-lg px-3 py-2 text-sm"
        >
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        New here?{" "}
        <Link
          href="/register"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
