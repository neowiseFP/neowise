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
            "You're a helpful financial assistant. Based on the assistant's last message, suggest a thoughtful, curiosity-sparking follow-up question. Keep it conversational and under 30 words.",
        },
        {
          role: "user",
          content: reply,
        },
      ],
    });

    const followUp = completion.choices[0].message.content;
    res.status(200).json({ followUp });
  } catch (err) {
    console.error("GPT follow-up error:", err);
    res.status(500).json({ error: "Failed to generate follow-up" });
  }
}