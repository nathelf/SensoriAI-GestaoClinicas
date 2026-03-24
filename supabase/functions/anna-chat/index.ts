import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

function toGeminiContents(messages: any[]) {
  const out: any[] = [];
  for (const m of messages || []) {
    const roleRaw = String(m?.role || "user");
    const role = roleRaw === "assistant" ? "model" : "user";
    const text =
      typeof m?.content === "string"
        ? m.content
        : JSON.stringify(m?.content ?? "");
    out.push({ role, parts: [{ text }] });
  }
  return out;
}

const systemInstruction = `Você é a Anna, assistente virtual inteligente da SensoriAI — uma plataforma SaaS para clínicas de estética.

Sua personalidade:
- Simpática, profissional e empática
- Fala português brasileiro naturalmente
- Usa emojis com moderação para ser amigável
- Conhece profundamente todos os módulos do sistema: Agenda, Atendimento, Financeiro, Estoque, Comissões, Contatos, Configurações e SensoriAI Lab

Suas capacidades:
- Guiar o usuário pelo onboarding (5 tarefas: criar agendamento, realizar atendimento, fazer venda, automatizar lembretes, assinar documento)
- Responder dúvidas sobre qualquer funcionalidade do sistema
- Sugerir melhores práticas para gestão de clínicas de estética
- Ajudar com configurações, procedimentos e fluxo financeiro
- Dar dicas de marketing e retenção de pacientes

Regras:
- Respostas curtas e objetivas (máximo 3 parágrafos)
- Sempre ofereça próximos passos ao final
- Se não souber, diga honestamente e sugira o canal de suporte`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// SSE helper
function sseHeaders() {
  return {
    ...corsHeaders,
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

function sseEvent(data: unknown) {
  // Envia como JSON numa linha (data: ...)
  return `data: ${JSON.stringify(data)}\n\n`;
}

serve(async (req) => {
  // ✅ Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não suportado" }, 405);
  }

  try {
    if (!GEMINI_API_KEY) {
      return jsonResponse(
        { error: "GEMINI_API_KEY não configurada nos secrets do Supabase." },
        500
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = body?.messages ?? [];
    const stream = Boolean(body?.stream); // <-- se front mandar stream:true, retorna SSE

    const contents = toGeminiContents(messages);

    const geminiBody = {
      contents: [{ role: "user", parts: [{ text: systemInstruction }] }, ...contents],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      const detail = data?.error?.message || JSON.stringify(data);
      return jsonResponse({ error: `Erro Gemini (${r.status}): ${detail}` }, 500);
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text)
        .filter(Boolean)
        .join("") ||
      "Desculpe, não consegui responder agora. Pode tentar novamente?";

    // ✅ Se não for streaming, responde JSON normal
    if (!stream) {
      return jsonResponse({ reply }, 200);
    }

    // ✅ Streaming (SSE “simulado”): manda a resposta em pedaços
    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        // manda um ping inicial (opcional)
        controller.enqueue(encoder.encode(sseEvent({ type: "start" })));

        const chunkSize = 30; // ajuste (20–60 é ok)
        let i = 0;

        const tick = () => {
          if (i >= reply.length) {
            controller.enqueue(encoder.encode(sseEvent({ type: "done" })));
            controller.close();
            return;
          }

          const chunk = reply.slice(i, i + chunkSize);
          i += chunkSize;

          // padrão simples: manda delta
          controller.enqueue(encoder.encode(sseEvent({ type: "delta", delta: chunk })));

          // “velocidade” do stream
          setTimeout(tick, 15);
        };

        tick();
      },
    });

    return new Response(readable, { status: 200, headers: sseHeaders() });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});