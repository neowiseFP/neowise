import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session ID" });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("messages")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to load session" });
  }

  return res.status(200).json({ messages: data.messages });
}