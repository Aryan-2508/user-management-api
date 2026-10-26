import { z } from "zod";

// Validation for creating a user
export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    email: z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .max(254, "Email cannot exceed 254 characters")
        .transform((email) => email.toLowerCase()),

    age: z
        .number()
        .int("Age must be an integer")
        .min(0, "Age cannot be negative")
        .max(130, "Age cannot exceed 130")
        .optional(),
});

// Validation for updating a user
export const updateUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must contain at least 2 characters")
            .max(100, "Name cannot exceed 100 characters")
            .optional(),

        email: z
            .string()
            .trim()
            .email("Please provide a valid email address")
            .max(254, "Email cannot exceed 254 characters")
            .transform((email) => email.toLowerCase())
            .optional(),

        age: z
            .number()
            .int("Age must be an integer")
            .min(0, "Age cannot be negative")
            .max(130, "Age cannot exceed 130")
            .optional(),
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field must be provided for an update",
    );

// Export TypeScript types inferred from the schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
