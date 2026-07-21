import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { useAuth } from "@/providers/AuthProvider";
import type { RegisterRequest } from "../types/auth.types";

export function useRegister() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      login(data);
      router.push("/dashboard");
    },
  });
}
