import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { question, timestamp } = req.body;

  const { error } = await supabase
    .from("questions")
    .insert([{ question, timestamp }]);

  if (error) {
    console.error("Insert error:", error);
    return res.status(500).json({ error: "Failed to log question" });
  }

  res.status(200).json({ status: "ok" });
}