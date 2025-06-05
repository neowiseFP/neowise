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
      model: "gpt-4", // fallback to "gpt-3.5-turbo" if needed
      stream: false,
      messages,
    });

    const reply = response.choices?.[0]?.message?.content || "Sorry, something went wrong.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("OpenAI error:", err.message);
    return new Response(JSON.stringify({ reply: "Sorry, something went wrong." }), {
      status: 500,
    });
  }
}