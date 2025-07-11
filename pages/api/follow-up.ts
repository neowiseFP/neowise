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
          content: `
You are Neo — a calm, modern financial assistant trained by a top-tier CFP®.

You speak like a smart, trusted friend — clear, warm, and down-to-earth. Your job is to gently keep the conversation going, even if the user isn’t sure what to ask next.

Write one short, natural follow-up line to encourage continued conversation. It should feel human and easygoing, not too formal or robotic. You can use friendly phrases or gentle prompts to keep things moving. Be sure to avoid asking direct questions or repeating what's already been said.

No hype, no filler. Just helpful momentum and empathy.

Examples:
- “Want to dive into that a bit more?”
- “I know that’s a lot! Want to go over any part of it?”
- “This is a big step — ready to take it one piece at a time?”
- “Don’t worry, you’re doing great! Anything you’d like to break down more?”

Respond as JSON:
{
  "reply": "short follow-up message only",
  "suggestions": ["suggested question 1", "suggested question 2"]
}
          `.trim(),
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