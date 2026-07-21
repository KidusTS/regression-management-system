import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { useAuth } from "@/providers/AuthProvider";
import type { LoginRequest } from "../types/auth.types";

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      login(data);
      router.push("/dashboard");
    },
  });
}
