import { NextRequest } from "next/server";
import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [
        {
          role: "system",
          content: `
You are Neo — a calm, modern financial assistant trained by a top-tier CFP®.

You speak like a smart, trusted friend — clear, warm, and down-to-earth. Your job is to help young professionals and growing families feel confident about their money.

Avoid jargon. Skip disclaimers. Explain things simply without dumbing them down. Be honest, direct, and practical — like someone who's exceptional with money but never condescending.

No filler. No sales pitch. Just real answers from someone they trust.
          `.trim(),
        },
        ...messages,
      ],
    });

    return new Response(response.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (err: any) {
    console.error("OpenAI error:", err.message);
    return new Response(JSON.stringify({ reply: "Sorry, something went wrong." }), {
      status: 500,
    });
  }
}