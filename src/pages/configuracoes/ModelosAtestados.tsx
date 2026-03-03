import { useState } from "react";
import { motion } from "framer-motion";
import { FileSignature, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Model {
  id: string;
  name: string;
  model_type: string;
  content: string | null;
}

const empty = { name: "", model_type: "atestado", content: "" };

export default function ModelosAtestados() {
  const { data, loading, create, update, remove } = useCrud<Model>({ table: "certificate_models" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (m: Model) => { setEditing(m); setForm({ name: m.name, model_type: m.model_type, content: m.content || "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, model_type: form.model_type, content: form.content || null };
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
            <FileSignature className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Modelos de Atestados e Prescrições</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo modelo
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum modelo cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map(m => (
              <div key={m.id} className="stat-card !p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground capitalize">{m.model_type}</span>
                  <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Modelo" : "Novo Modelo"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Tipo">
          <FormSelect value={form.model_type} onChange={e => set("model_type", e.target.value)}>
            <option value="atestado">Atestado</option>
            <option value="prescricao">Prescrição</option>
            <option value="termo">Termo</option>
          </FormSelect>
        </FormField>
        <FormField label="Conteúdo (texto do modelo)"><FormTextarea value={form.content} onChange={e => set("content", e.target.value)} rows={4} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
