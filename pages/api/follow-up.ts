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
          content: `You're a capable and friendly financial assistant named Neo.

You speak like a calm, thoughtful expert — someone people trust and feel comfortable with. You avoid stiff phrases like “That's right!” or overly corporate talk.

Given the assistant’s last message, do two things:

1. Write one natural, helpful follow-up line that continues the conversation in a warm, human tone. No more than 25 words.

2. Suggest 2–3 clickable follow-up questions. Keep them relevant and under 20 words.

Respond as JSON:
{
  "reply": "natural next line",
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