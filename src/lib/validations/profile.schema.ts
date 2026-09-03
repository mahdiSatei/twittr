import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  displayName: z.string().max(50, "Display name cannot exceed 50 characters").optional().nullable(),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
});