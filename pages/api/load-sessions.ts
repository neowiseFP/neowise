import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ sessions: data });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error occurred." });
  }
}