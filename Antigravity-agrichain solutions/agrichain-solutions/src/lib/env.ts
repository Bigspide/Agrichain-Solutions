import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().optional(),
  HOSTNAME: z.string().optional(),
  PORT: z.string().optional(),

  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_TEXT_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_VOICE_MODEL: z.string().default("gpt-4o-mini-tts"),
  OPENAI_TRANSCRIBE_MODEL: z.string().default("gpt-4o-mini-transcribe"),

  EVM_RPC_URL: z.string().optional().default(""),
  EVM_PRIVATE_KEY: z.string().optional().default(""),
  EVM_CHAIN_ID: z.string().default("11155111"),
  TRACE_REGISTRY_ADDRESS: z.string().optional().default(""),
  CERTIFICATION_REGISTRY_ADDRESS: z.string().optional().default(""),
  BATCH_ANCHOR_ADDRESS: z.string().optional().default(""),

  CINETPAY_API_KEY: z.string().optional().default(""),
  CINETPAY_SITE_ID: z.string().optional().default(""),

  SENTINEL_HUB_CLIENT_ID: z.string().optional().default(""),
  SENTINEL_HUB_CLIENT_SECRET: z.string().optional().default(""),

  OSRM_BASE_URL: z.string().default("https://router.project-osrm.org"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables. See logs.");
  }
}

export const env = parsed.success
  ? parsed.data
  : ({
      ...envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
        AUTH_SECRET: process.env.AUTH_SECRET || "dev-secret-change-me-32-bytes!!",
        NODE_ENV: process.env.NODE_ENV || "development",
      }),
    } as z.infer<typeof envSchema>);

export const isProduction = env.NODE_ENV === "production";
export const hasOpenAI = Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 0);
export const hasEVM = Boolean(env.EVM_RPC_URL && env.EVM_PRIVATE_KEY && env.TRACE_REGISTRY_ADDRESS);
