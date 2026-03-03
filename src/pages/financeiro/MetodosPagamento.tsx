import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export default function MetodosPagamento() {
  const { data, loading, create, update, remove } = useCrud<PaymentMethod>({ table: "payment_methods" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setName(""); setActive(true); setModalOpen(true); };
  const openEdit = (m: PaymentMethod) => { setEditing(m); setName(m.name); setActive(m.active); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) await update(editing.id, { name, active });
    else await create({ name, active } as any);
    setSaving(false);
    setModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Métodos de Pagamento</h1>
          <button onClick={openCreate} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum método cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map(m => (
              <div key={m.id} className="stat-card !p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{m.name}</span>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${m.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                  {m.active ? "Ativo" : "Inativo"}
                </span>
                <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Método" : "Novo Método"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={name} onChange={e => setName(e.target.value)} placeholder="Ex: PIX, Cartão de Crédito" required /></FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="rounded border-border" />
          <span className="text-sm text-foreground">Ativo</span>
        </label>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
