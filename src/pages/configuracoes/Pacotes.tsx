import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Pkg {
  id: string;
  name: string;
  description: string | null;
  sessions_count: number;
  price: number;
  valid_days: number | null;
  active: boolean;
}

const empty = { name: "", description: "", sessions_count: "1", price: "0", valid_days: "" };

export default function Pacotes() {
  const { data, loading, create, update, remove } = useCrud<Pkg>({ table: "packages" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Pkg) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", sessions_count: String(p.sessions_count), price: String(p.price), valid_days: p.valid_days ? String(p.valid_days) : "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      sessions_count: parseInt(form.sessions_count) || 1,
      price: parseFloat(form.price) || 0,
      valid_days: form.valid_days ? parseInt(form.valid_days) : null,
    };
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
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Pacotes</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pacote cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {data.map(p => (
              <div key={p.id} className="stat-card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sessions_count} sessões · R$ {Number(p.price).toFixed(2)}{p.valid_days ? ` · ${p.valid_days} dias` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Pacote" : "Novo Pacote"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Descrição"><FormTextarea value={form.description} onChange={e => set("description", e.target.value)} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nº de sessões"><FormInput type="number" min={1} value={form.sessions_count} onChange={e => set("sessions_count", e.target.value)} /></FormField>
          <FormField label="Preço (R$)"><FormInput type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} /></FormField>
        </div>
        <FormField label="Validade (dias)"><FormInput type="number" value={form.valid_days} onChange={e => set("valid_days", e.target.value)} placeholder="Opcional" /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
