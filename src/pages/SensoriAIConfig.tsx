import { motion } from "framer-motion";
import { Bot, Save, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getIntegrationConfig, setIntegrationConfig } from "@/hooks/useChatIntegration";
import { toast } from "sonner";

export default function SensoriAIConfig() {
  const [integrationUrl, setIntegrationUrl] = useState("");
  const [notifyOnOpen, setNotifyOnOpen] = useState(false);

  useEffect(() => {
    const { url, notifyOnOpen: notify } = getIntegrationConfig();
    setIntegrationUrl(url);
    setNotifyOnOpen(notify);
  }, []);

  const saveIntegration = () => {
    setIntegrationConfig(integrationUrl, notifyOnOpen);
    toast.success("Configuração de integração salva.");
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Configurações da IA</h1>
        <p className="text-sm text-muted-foreground mb-6">Personalize o assistente e conecte com chatbot ou call center</p>

        <div className="space-y-4">
          <div className="stat-card space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">System Prompt</h3>
            </div>
            <textarea
              rows={6}
              defaultValue="Você é um assistente de vendas gentil e profissional para uma clínica de estética. Seu objetivo é converter consultas em agendamentos. Use tom empático e destaque benefícios dos procedimentos."
              className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="stat-card space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Tom de Voz</h3>
            <div className="flex flex-wrap gap-2">
              {["Profissional", "Empático", "Casual", "Técnico"].map(t => (
                <button key={t} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${t === "Empático" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-muted-foreground hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Integração Chatbot / Call Center */}
          <div className="stat-card space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Integração com Chatbot ou Call Center</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Ao abrir a conversa com a Lorena (widget ou página IA), o sistema pode notificar uma URL de sua escolha. Use para conectar seu chatbot, central de atendimento ou CRM.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL de integração (webhook)</label>
              <input
                type="url"
                value={integrationUrl}
                onChange={e => setIntegrationUrl(e.target.value)}
                placeholder="https://seu-servidor.com/webhook/sensori"
                className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnOpen}
                onChange={e => setNotifyOnOpen(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Notificar ao abrir a conversa (POST com userId, sessionId, timestamp)</span>
            </label>
            <button type="button" onClick={saveIntegration} className="text-sm text-primary font-medium hover:underline">
              Salvar integração
            </button>
          </div>

          <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </motion.div>
    </div>
  );
}
