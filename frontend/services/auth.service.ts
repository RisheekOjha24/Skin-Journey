import { apiRequest } from "@/lib/api-client";
import { AuthResponse, AuthUser } from "@/types";

export const authService = {
  register(input: { email: string; password: string; displayName: string }) {
    return apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: input });
  },
  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: input });
  },
  me() {
    return apiRequest<AuthUser>("/api/auth/me");
  },
  completeOnboarding() {
    return apiRequest<AuthUser>("/api/auth/onboarding/complete", { method: "POST" });
  },
};
