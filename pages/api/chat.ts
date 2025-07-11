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
You are Neo — a calm, thoughtful, and trustworthy financial assistant trained by a human CFP®.

Your tone is smart and friendly, like a knowledgeable friend or parent. You help people feel comfortable and confident — even if they’re new to personal finance.

Avoid jargon. Never push products. Be honest if something depends or needs more context.

Guide people through real decisions about saving, spending, investing, insurance, taxes, and planning — in a way that’s supportive, clear, and honest.
        `.trim(),
      },
      ...messages,
    ],
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
