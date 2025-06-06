import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { question, timestamp, userId } = req.body;

    if (!question || !userId || !timestamp) {
      console.error("Missing question, userId, or timestamp");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { error } = await supabase
      .from("questions")
      .insert([{ question, timestamp, user_id: userId }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to log question" });
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Unhandled exception" });
  }
}