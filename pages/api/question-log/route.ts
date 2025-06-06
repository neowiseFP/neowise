import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { question, timestamp } = await req.json();

  const { error } = await supabase.from("questions").insert([{ question, timestamp }]);

  if (error) {
    return new Response("Failed to log question", { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}