import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { streamAnnaChat } from "@/lib/annaChat";
import { useChatIntegration } from "@/hooks/useChatIntegration";
import type { ChatMessage } from "@/lib/annaChat";

type Msg = ChatMessage;

export function AnnaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { triggerChatOpened } = useChatIntegration();

  useEffect(() => {
    if (open) triggerChatOpened();
  }, [open, triggerChatOpened]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    setLoading(true);

    // otimista: já coloca a msg do usuário na tela
    setMessages((prev) => [...prev, userMsg]);

    try {
      // envia só as últimas 10 mensagens + a atual
      const toSend = [...messages, userMsg].slice(-10);

      await streamAnnaChat({
        messages: toSend,
        onDelta: (fullText) => {
          // ✅ adiciona a resposta como uma nova mensagem (sem "stream/upsert")
          setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
        },
        onDone: () => setLoading(false),
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error("Erro ao conectar com a Anna");
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 lg:bottom-6 right-20 lg:right-24 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-pastel-rose text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 lg:bottom-24 right-4 lg:right-24 z-50 w-[360px] max-h-[500px] bg-card rounded-3xl shadow-2xl border border-border/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Anna</p>
                <p className="text-xs text-muted-foreground">Assistente SensoriAI</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                  <p>Olá! Sou a Anna 👋</p>
                  <p className="mt-1">Como posso ajudar você hoje?</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3.5 py-2.5 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/30">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Pergunte algo à Anna..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}