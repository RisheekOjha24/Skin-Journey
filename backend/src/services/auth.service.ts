import { userRepository } from "../db/repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password.util";
import { signAuthToken } from "../utils/jwt.util";
import { ApiError } from "../utils/api-error.util";
import { RegisterInput, LoginInput } from "../validations/auth.validation";

function toPublicUser(user: {
  id: string;
  email: string;
  display_name: string;
  onboarding_completed_at: string | null;
  created_at: string;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    onboardingCompleted: Boolean(user.onboarding_completed_at),
    createdAt: user.created_at,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = userRepository.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    const token = signAuthToken({ userId: user.id, email: user.email });
    return { token, user: toPublicUser(user) };
  },

  async login(input: LoginInput) {
    const user = userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isValid = await comparePassword(input.password, user.password_hash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = signAuthToken({ userId: user.id, email: user.email });
    return { token, user: toPublicUser(user) };
  },

  getProfile(userId: string) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return toPublicUser(user);
  },

  completeOnboarding(userId: string) {
    userRepository.markOnboardingComplete(userId);
    return this.getProfile(userId);
  },
};
