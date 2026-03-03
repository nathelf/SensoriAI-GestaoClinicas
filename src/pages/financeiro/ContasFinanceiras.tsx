import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface FinancialAccount {
  id: string;
  name: string;
  account_type: string;
  balance: number;
}

const empty = { name: "", account_type: "conta_corrente", balance: "0" };
const TIPOS = [
  { value: "conta_corrente", label: "Conta Corrente" },
  { value: "caixa", label: "Caixa" },
  { value: "poupanca", label: "Poupança" },
  { value: "investimento", label: "Investimento" },
];

export default function ContasFinanceiras() {
  const { data, loading, create, update, remove } = useCrud<FinancialAccount>({ table: "financial_accounts" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialAccount | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c: FinancialAccount) => { setEditing(c); setForm({ name: c.name, account_type: c.account_type, balance: String(c.balance) }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, account_type: form.account_type, balance: parseFloat(form.balance) || 0 };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Contas Financeiras</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova conta
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma conta cadastrada.</div>
        ) : (
          <div className="space-y-3">
            {data.map(c => (
              <div key={c.id} className="stat-card !p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Landmark className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{TIPOS.find(t => t.value === c.account_type)?.label || c.account_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">R$ {Number(c.balance).toFixed(2)}</span>
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Conta" : "Nova Conta"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Tipo">
          <FormSelect value={form.account_type} onChange={e => set("account_type", e.target.value)}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </FormSelect>
        </FormField>
        <FormField label="Saldo inicial (R$)"><FormInput type="number" step="0.01" value={form.balance} onChange={e => set("balance", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
