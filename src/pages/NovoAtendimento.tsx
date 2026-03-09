import { motion } from "framer-motion";
import { useState } from "react";
import { User, AlertTriangle, ChevronRight, ClipboardList } from "lucide-react";

const skinTypes = ["Seca", "Oleosa", "Mista", "Normal"];
const procedures = ["Consulta", "Procedimento", "Avaliação", "Retorno", "Outros"];

export default function NovoAtendimento() {
  const [skinType, setSkinType] = useState("Mista");
  const [isPregnant, setIsPregnant] = useState(false);
  const [selectedProcs, setSelectedProcs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"anamnese" | "mapa" | "evolucao">("anamnese");

  const toggleProc = (p: string) =>
    setSelectedProcs((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Novo Atendimento</h1>
        <p className="text-sm text-muted-foreground mb-4">Preencha a anamnese e registre o procedimento</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
          {(["anamnese", "mapa", "evolucao"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize
                ${activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {tab === "anamnese" ? "Anamnese" : tab === "mapa" ? "Mapa Facial" : "Evolução"}
            </button>
          ))}
        </div>

        {activeTab === "anamnese" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Identification */}
            <div className="stat-card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Identificação</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data do Atendimento</label>
                  <input type="date" defaultValue="2026-03-03" className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Profissional</label>
                  <select className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Dra. Nathalia Mendes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Objetivo da Visita</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Redução de linhas de expressão, hidratação..."
                  className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>

            {/* Health History */}
            <div className="stat-card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
                <h3 className="font-semibold text-sm text-foreground">Histórico de Saúde</h3>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Alergias <span className="px-1.5 py-0.5 text-[10px] bg-destructive rounded-md text-destructive-foreground font-medium ml-1">Importante</span>
                </label>
                <input
                  placeholder="Medicamentos, cosméticos, metais..."
                  className="w-full px-3 py-2.5 bg-card border border-destructive/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Histórico de Procedimentos</label>
                <div className="flex flex-wrap gap-2">
                  {procedures.map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleProc(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border
                        ${selectedProcs.includes(p) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-muted-foreground hover:bg-muted"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Uso de Medicamentos</label>
                <textarea rows={2} placeholder="Uso contínuo de anticoagulantes, corticoides, etc." className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Gestante / Lactante</label>
                <button
                  onClick={() => setIsPregnant(!isPregnant)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isPregnant ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-card shadow absolute top-0.5 transition-transform ${isPregnant ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Skin Assessment */}
            <div className="stat-card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Avaliação Clínica</h3>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Tipo de Pele</label>
                <div className="flex gap-1 bg-muted rounded-xl p-1">
                  {skinTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSkinType(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
                        ${skinType === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Glogau</label>
                  <select className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>I - Sem rugas</option>
                    <option>II - Rugas em movimento</option>
                    <option>III - Rugas em repouso</option>
                    <option>IV - Apenas rugas</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fitzpatrick</label>
                  <select className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {["I", "II", "III", "IV", "V", "VI"].map((f) => (
                      <option key={f}>Fototipo {f}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Observações de Pele</label>
                <textarea rows={2} placeholder="Presença de melasmas, acne ativa, cicatrizes..." className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]">
              Salvar e Continuar para Mapa Facial
            </button>
          </motion.div>
        )}

        {activeTab === "mapa" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
            <h3 className="font-semibold text-foreground mb-4">Mapa Facial Interativo</h3>
            {/* SVG Face Map */}
            <div className="flex justify-center">
              <svg viewBox="0 0 300 400" className="w-full max-w-xs">
                <ellipse cx="150" cy="180" rx="110" ry="145" fill="hsl(35, 55%, 92%)" stroke="hsl(195, 25%, 76%)" strokeWidth="1.5" />
                {/* Eyes */}
                <ellipse cx="110" cy="155" rx="22" ry="10" fill="none" stroke="hsl(195, 25%, 76%)" strokeWidth="1" />
                <ellipse cx="190" cy="155" rx="22" ry="10" fill="none" stroke="hsl(195, 25%, 76%)" strokeWidth="1" />
                {/* Nose */}
                <path d="M145 175 Q150 210 155 175" fill="none" stroke="hsl(195, 25%, 76%)" strokeWidth="1" />
                {/* Mouth */}
                <path d="M120 240 Q150 260 180 240" fill="none" stroke="hsl(195, 25%, 76%)" strokeWidth="1" />
                {/* Injection Points */}
                {[
                  { x: 110, y: 120, label: "Testa E" },
                  { x: 150, y: 115, label: "Glabela" },
                  { x: 190, y: 120, label: "Testa D" },
                  { x: 85, y: 155, label: "Pé de galinha E" },
                  { x: 215, y: 155, label: "Pé de galinha D" },
                  { x: 130, y: 230, label: "Lábio E" },
                  { x: 170, y: 230, label: "Lábio D" },
                  { x: 150, y: 280, label: "Queixo" },
                ].map((point, i) => (
                  <g key={i} className="cursor-pointer group">
                    <circle cx={point.x} cy={point.y} r="8" fill="hsl(195, 25%, 76%)" fillOpacity="0.3" stroke="hsl(195, 25%, 76%)" strokeWidth="1.5" className="transition-all hover:fill-opacity-60 hover:r-10" />
                    <circle cx={point.x} cy={point.y} r="3" fill="hsl(195, 25%, 60%)" />
                    <text x={point.x} y={point.y + 18} textAnchor="middle" className="text-[7px] fill-current text-muted-foreground">{point.label}</text>
                  </g>
                ))}
              </svg>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Toque nos pontos para registrar aplicações</p>
          </motion.div>
        )}

        {activeTab === "evolucao" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="stat-card space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Evolução Clínica</h3>
              <textarea rows={4} placeholder="Descreva a evolução do procedimento..." className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div className="stat-card space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Recomendações Home Care</h3>
              {["Filtro solar a cada 2h", "Não baixar a cabeça por 4h", "Evitar exercício físico 24h", "Não massagear a área tratada"].map((rec, i) => (
                <label key={i} className="flex items-center gap-2.5 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary" />
                  <span className="text-foreground">{rec}</span>
                </label>
              ))}
            </div>
            <div className="stat-card">
              <label className="text-xs text-muted-foreground mb-1 block">Data de Retorno Sugerida</label>
              <input type="date" defaultValue="2026-03-18" className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-[10px] text-muted-foreground mt-1">Calculado: +15 dias para retoque</p>
            </div>
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]">
              Finalizar Atendimento
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
