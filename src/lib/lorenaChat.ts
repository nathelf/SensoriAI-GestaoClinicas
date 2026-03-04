import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/lorena-chat`;

export async function streamLorenaChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  try {
    const { data, error } = await supabase.auth.getSession();
    const session = data.session;

    if (error) throw error;
    if (!session?.access_token) throw new Error("Sem sessão. Faça login novamente.");

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`LorenaChat error (${resp.status}): ${t}`);
    }

    const { reply } = await resp.json();
    onDelta(String(reply ?? ""));
    return "ok";
  } finally {
    onDone();
  }
}