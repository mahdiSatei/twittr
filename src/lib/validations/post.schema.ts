import { z } from "zod";

export const PostSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(280, "Post cannot exceed 280 characters")
    .refine((val) => val.trim().length > 0, "Post cannot contain only spaces"),
});