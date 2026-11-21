"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios from "axios";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schemas";
import { useRegister } from "../hooks/useRegister";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/Field";

export function RegisterForm() {
  const { mutate: register_, isPending, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const errorMessage = !error
    ? null
    : axios.isAxiosError(error) && !error.response
      ? "Can't reach the server. Please try again later."
      : axios.isAxiosError(error) &&
          typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Registration failed";

  return (
    <form
      onSubmit={handleSubmit((data) => register_(data))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">It only takes a moment.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          {(id) => (
            <Input
              id={id}
              autoComplete="given-name"
              autoFocus
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
          )}
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          {(id) => (
            <Input
              id={id}
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
          )}
        </Field>
      </div>
      <Field label="Email" error={errors.email?.message}>
        {(id) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        )}
      </Field>
      <Field
        label="Password"
        hint="At least 8 characters"
        error={errors.password?.message}
      >
        {(id) => (
          <Input
            id={id}
            type="password"
            autoComplete="new-password"
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
        {isPending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
