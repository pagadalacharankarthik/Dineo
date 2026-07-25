import { z } from "zod";

const isSequentialOrRepeated = (pass: string): boolean => {
  const lowercase = pass.toLowerCase();
  
  // 1. Check for repeated characters (e.g. "aaaa", "1111")
  const repeatRegex = /(.)\1{3,}/; 
  if (repeatRegex.test(lowercase)) return true;

  // 2. Check for alphabetical and numerical sequences of length 4 or more (e.g. "abcde", "5678")
  for (let i = 0; i < lowercase.length - 3; i++) {
    const char1 = lowercase.charCodeAt(i);
    const char2 = lowercase.charCodeAt(i + 1);
    const char3 = lowercase.charCodeAt(i + 2);
    const char4 = lowercase.charCodeAt(i + 3);

    // Ascending sequence (e.g. 1-2-3-4 or a-b-c-d)
    if (char2 === char1 + 1 && char3 === char2 + 1 && char4 === char3 + 1) {
      return true;
    }
    // Descending sequence (e.g. 4-3-2-1 or d-c-b-a)
    if (char2 === char1 - 1 && char3 === char2 - 1 && char4 === char3 - 1) {
      return true;
    }
  }

  // 3. Check for keyboard row sequences (length 4 or more, e.g. "qwer", "asdf")
  const keyboardRows = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm"
  ];
  for (const row of keyboardRows) {
    for (let i = 0; i < row.length - 3; i++) {
      const seq = row.substring(i, i + 4);
      const revSeq = seq.split("").reverse().join("");
      if (lowercase.includes(seq) || lowercase.includes(revSeq)) {
        return true;
      }
    }
  }

  return false;
};

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    restaurantName: z
      .string()
      .min(1, "Restaurant name is required")
      .min(2, "Restaurant name must be at least 2 characters")
      .max(150, "Restaurant name must be less than 150 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine(
        (val) => {
          const domain = val.split("@")[1]?.toLowerCase() || "";
          const unverified = ["mailinator.com", "yopmail.com", "tempmail.com", "temp-mail.org", "10minutemail.com", "dispostable.com", "guerrillamail.com"];
          return !unverified.includes(domain);
        },
        { message: "Disposable or unverified email domains are not allowed" }
      ),
    mobile: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .refine((val) => !isSequentialOrRepeated(val), {
        message: "Password contains repeated sequences or characters (e.g., '1234' or 'asdf')",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .refine((val) => !isSequentialOrRepeated(val), {
        message: "Password contains repeated sequences or characters (e.g., '1234' or 'asdf')",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    token: z.string().min(1, "Reset token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
