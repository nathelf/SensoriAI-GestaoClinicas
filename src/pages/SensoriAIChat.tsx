import { motion } from "framer-motion";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { streamAnnaChat } from "@/lib/annaChat";
import { useChatIntegration } from "@/hooks/useChatIntegration";
import type { ChatMessage } from "@/lib/annaChat";

export default function SensoriAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { triggerChatOpened } = useChatIntegration();
  const integrationFired = useRef(false);

  useEffect(() => {
    if (!integrationFired.current) {
      integrationFired.current = true;
      triggerChatOpened();
    }
  }, [triggerChatOpened]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const result = await streamAnnaChat({
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => setLoading(false),
      });
      if (result === "rate_limit") toast.error("Muitas requisições. Aguarde alguns segundos.");
      else if (result === "credits") toast.error("Créditos de IA esgotados.");
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error("Erro ao conectar com a Anna");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      <div className="p-4 lg:p-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">Assistente SensoriAI</h1>
        <p className="text-sm text-muted-foreground">Converse com a Anna. Ao abrir esta tela, seu chatbot ou central de atendimento pode ser notificado (configurar em Config. IA).</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
            <p>Olá! Sou a Anna 👋</p>
            <p className="mt-1">Como posso ajudar sua clínica hoje?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border/40 text-foreground rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </motion.div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="bg-card border border-border/40 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 lg:p-6 pt-2 border-t border-border/30">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Pergunte algo à Anna..."
            className="flex-1 px-4 py-3 bg-card border border-border/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="p-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
