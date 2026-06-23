import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is required for cloud transcription" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "audio file is required" }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.set("file", file);
  upstream.set("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: upstream,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

