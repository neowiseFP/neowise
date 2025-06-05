import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { messageIndex, feedback, message, timestamp } = await req.json();

  const { error } = await supabase.from("feedback").insert([
    { message_index: messageIndex, feedback, message, timestamp },
  ]);

  if (error) {
    return new Response("Failed to log feedback", { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}