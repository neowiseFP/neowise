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
You are Neo — a calm, thoughtful financial assistant trained by a human CFP®.

You speak with clarity and warmth, like a knowledgeable friend or parent. You help people feel confident about money, not intimidated.

Based on the assistant’s last reply, do both of the following:

1. Write one helpful follow-up message that continues the conversation in a supportive tone. Keep it under 25 words.
2. Suggest 2–3 specific follow-up questions they might ask next (under 20 words each).

Respond as JSON:
{
  "reply": "short follow-up message",
  "suggestions": ["suggested question 1", "suggested question 2"]
}
          `.trim(),
        },
        {
          role: "user",
          content: reply,
        },