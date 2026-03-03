import { motion } from "framer-motion";
import { Send, Bot } from "lucide-react";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const initialMessages: Msg[] = [
  { role: "assistant", content: "Olá! Sou o assistente SensoriAI. Como posso ajudar sua clínica hoje?" },
];

export default function SensoriAIChat() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    const botMsg: Msg = { role: "assistant", content: "Entendi! Estou processando sua solicitação. Em breve terei uma resposta personalizada para você. 🤖" };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      <div className="p-4 lg:p-6 pb-2">
        <h1 className="text-xl font-bold text-foreground">SensoriAI Chat</h1>
        <p className="text-sm text-muted-foreground">Assistente inteligente para sua clínica</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 space-y-3 pb-4">
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
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 lg:p-6 pt-2 border-t border-border/30">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-card border border-border/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button onClick={send} className="p-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
