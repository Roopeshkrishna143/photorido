import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

const optionalEmailString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email().optional());

const optionalSecretString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters long.").optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().min(1).default("/api"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required."),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGINS: optionalTrimmedString,
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters long."),
  JWT_REFRESH_SECRET: optionalSecretString,
  AUTH_COOKIE_NAME: z.string().min(1).default("photorido_auth_token"),
  REFRESH_COOKIE_NAME: z.string().min(1).default("photorido_refresh_token"),
  ACCESS_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(24),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  JSON_BODY_LIMIT: z.string().min(2).default("20mb"),
  // GOOGLE_CLIENT_ID: optionalTrimmedString,
  GOOGLE_CLIENT_ID: optionalTrimmedString,
  GOOGLE_MAPS_API_KEY: optionalTrimmedString,
  MAILTRAP_API_URL: z.string().url().default("https://send.api.mailtrap.io/api/send"),
  MAILTRAP_API_TOKEN: optionalTrimmedString,
  MAILTRAP_SENDER_EMAIL: optionalEmailString,
  MAILTRAP_SENDER_NAME: z.string().trim().default("Photorido"),
  OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(30).default(10),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(0).max(600).default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  OTP_MOBILE_TEST_RECIPIENT_EMAIL: optionalEmailString,
  ALLOW_PUBLIC_REGISTRATION: z.string().optional().transform((value) => value === "true"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid backend environment configuration:\n${issues}`);
}

export const env = parsedEnv.data;
const corsOrigins = [
  env.FRONTEND_URL,
  ...(env.CORS_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
].filter((origin, index, origins) => origins.indexOf(origin) === index);

export const resolvedEnv = {
  ...env,
  CORS_ORIGINS: corsOrigins,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET ?? env.JWT_ACCESS_SECRET,
};

