import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface TagItem {
  id: string;
  name: string;
  color: string | null;
}

const empty = { name: "", color: "primary" };
const COLOR_OPTIONS = [
  { value: "primary", class: "bg-primary/20 text-primary" },
  { value: "success", class: "bg-success/20 text-success-foreground" },
  { value: "warning", class: "bg-warning/20 text-warning-foreground" },
  { value: "destructive", class: "bg-destructive/20 text-destructive-foreground" },
  { value: "muted", class: "bg-muted text-muted-foreground" },
];

export default function Etiquetas() {
  const { data, loading, create, update, remove } = useCrud<TagItem>({ table: "tags" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (t: TagItem) => { setEditing(t); setForm({ name: t.name, color: t.color || "primary" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, color: form.color || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const colorClass = (c: string | null) => COLOR_OPTIONS.find(o => o.value === (c || "primary"))?.class || "bg-primary/20 text-primary";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Etiquetas</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma etiqueta cadastrada.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.map(t => (
              <div key={t.id} className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium ${colorClass(t.color)}`}>
                <span>{t.name}</span>
                <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-black/10"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-1 rounded hover:bg-black/10"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Etiqueta" : "Nova Etiqueta"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Cor">
          <FormSelect value={form.color} onChange={e => set("color", e.target.value)}>
            {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
          </FormSelect>
        </FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
