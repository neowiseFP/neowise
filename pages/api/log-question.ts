import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  const { question, timestamp } = await req.json();

  const { error } = await supabase.from("questions").insert([{ question, timestamp }]);

  if (error) {
    console.error("Supabase insert error:", error);
    return new Response(JSON.stringify({ error: "Failed to log question" }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}