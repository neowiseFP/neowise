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
          content: `You're a friendly, trusted, emotionally intelligent financial assistant named Neo.

Given the assistant’s last response, do two things:

1. Write one short, calm, and slightly reassuring follow-up message that sounds like a trusted advisor continuing the chat. Keep it warm, natural, and under 25 words.

2. Then write 2–3 helpful follow-up questions the user might ask next. Keep them short, clear, and practical.

Respond as a JSON object like this:

{
  "reply": "natural friendly next sentence",
  "suggestions": ["question 1", "question 2", "question 3"]
}`
        },
        {
          role: "user",
          content: reply,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "";

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in GPT output");

    const parsed = JSON.parse(match[0]);

    res.status(200).json(parsed);
  } catch (err) {
    console.error("GPT follow-up error:", err);
    res.status(500).json({ error: "Failed to generate follow-up" });
  }
}