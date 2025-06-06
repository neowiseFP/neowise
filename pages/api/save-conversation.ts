import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { userId, messages } = req.body;

    if (!userId || !messages) {
      console.error("Missing userId or messages");
      return res.status(400).json({ error: "Missing userId or messages" });
    }

    const { error } = await supabase
      .from("conversations")
      .upsert([
        {
          user_id: userId,
          messages,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: "user_id" });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to save conversation" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Unhandled exception" });
  }
}