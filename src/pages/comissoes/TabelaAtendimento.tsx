import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface CommissionRate {
  id: string;
  name: string;
  rate_percent: number;
  active: boolean;
}

export default function TabelaAtendimento() {
  const { data, loading, create, update, remove } = useCrud<CommissionRate>({ table: "commission_rates_attendance" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionRate | null>(null);
  const [name, setName] = useState("");
  const [ratePercent, setRatePercent] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setName(""); setRatePercent(""); setActive(true); setModalOpen(true); };
  const openEdit = (r: CommissionRate) => { setEditing(r); setName(r.name); setRatePercent(String(r.rate_percent)); setActive(r.active); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, rate_percent: parseFloat(ratePercent) || 0, active };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Tabela de Comissões de Atendimento</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova regra
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma regra de comissão de atendimento cadastrada.</div>
        ) : (
          <div className="space-y-2">
            {data.map(r => (
              <div key={r.id} className="stat-card !p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{r.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{Number(r.rate_percent).toFixed(1)}%</span>
                  {!r.active && <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">Inativa</span>}
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Regra" : "Nova Regra"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Toxina Botulínica" required /></FormField>
        <FormField label="Percentual (%) *"><FormInput type="number" step="0.1" value={ratePercent} onChange={e => setRatePercent(e.target.value)} required /></FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="rounded border-border" />
          <span className="text-sm text-foreground">Ativo</span>
        </label>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
