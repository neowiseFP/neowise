import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session id" });
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ messages: data?.messages || [] });
  } catch (err: any) {
    console.error("❌ Unexpected error in session route:", err);
    return res.status(500).json({ error: "Unexpected error occurred." });
  }
}