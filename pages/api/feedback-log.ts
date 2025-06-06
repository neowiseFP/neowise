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

  const { feedback, timestamp, userId } = req.body;

  const { error } = await supabase
    .from("feedback")
    .insert([{ feedback, timestamp, user_id: userId }]);

  if (error) {
    return res.status(500).json({ error: "Failed to log feedback" });
  }

  return res.status(200).json({ status: "ok" });
}