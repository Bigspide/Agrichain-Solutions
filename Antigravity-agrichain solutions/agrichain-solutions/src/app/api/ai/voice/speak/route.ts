import { NextResponse } from "next/server";
import { z } from "zod";

const speakSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().default("alloy"),
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is required for narration" }, { status: 503 });
  }

  const parsed = speakSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid narration payload" }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VOICE_MODEL || "gpt-4o-mini-tts",
      voice: parsed.data.voice,
      input: parsed.data.text,
      format: "mp3",
    }),
  });

  return new Response(response.body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "audio/mpeg" },
  });
}

