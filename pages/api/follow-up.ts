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
          content:
            "You're a helpful financial assistant. Based on the assistant's last reply, generate 2–3 short follow-up questions the user might ask next. Keep each one under 20 words and make them engaging. Return them as a plain list.",
        },
        {
          role: "user",
          content: reply,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "";
    const suggestions = raw
      .split("\n")
      .map((line) => line.replace(/^[\d\-\*\.\s]+/, "").trim())
      .filter(Boolean);

    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("GPT follow-up error:", err);
    res.status(500).json({ error: "Failed to generate follow-ups" });
  }
}