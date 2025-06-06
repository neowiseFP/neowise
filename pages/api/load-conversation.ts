import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string;

  const { data, error } = await supabase
    .from("conversations")
    .select("messages")
    .eq("user_id", userId)
    .single();

  if (error) {
    return res.status(200).json({ messages: [] }); // fallback to empty
  }

  return res.status(200).json({ messages: data.messages });
}