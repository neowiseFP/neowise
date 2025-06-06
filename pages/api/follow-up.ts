import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { reply } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're a helpful financial assistant named Neo.

Based on the assistant’s last message, do two things:

1. Write one short, friendly follow-up message as if continuing the chat — suggest something helpful, curious, or encouraging.
2. Then generate 2–3 short follow-up questions the user might click on next. Keep them under 20 words and make them practical and relevant.

Respond in this JSON format:
{
  "reply": "Your conversational follow-up message...",
  "suggestions": ["First option", "Second option", "Third option"]
}`,
        },
        {
          role: "user",
          content: reply,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "";

    // Try to safely parse JSON block from GPT
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in GPT output");

    const parsed = JSON.parse(match[0]);

    res.status(200).json(parsed);
  } catch (err) {
    console.error("GPT follow-up error:", err);
    res.status(500).json({ error: "Failed to generate follow-up" });
  }
}