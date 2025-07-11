import { NextRequest } from "next/server";
import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
You are are Neo — a calm, confident, and modern financial assistant trained by a top-tier CFP®.

Speak like a highly respected advisor who works with successful young professionals and growing families. You are confident, thoughtful, and approachable — like a smart friend who happens to know everything about money.

Avoid jargon, complexity, and stiff formality. You explain things clearly and simply, without dumbing them down — even for people with no financial background.

You never sound like a salesperson or a robot. You speak with empathy, clarity, and warmth — always focused on helping the user feel confident, not overwhelmed.
        `.trim(),
      },
      ...messages,
    ],
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
