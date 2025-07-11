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

  const { userId, messages, title } = req.body;

  if (!userId || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const { error } = await supabase
    .from("sessions")
    .insert([{ user_id: userId, messages, title }]);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to save session" });
  }

  return res.status(200).json({ success: true });
}