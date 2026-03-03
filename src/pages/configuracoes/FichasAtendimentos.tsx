import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Form {
  id: string;
  name: string;
  fields_count: number;
}

const empty = { name: "", fields_count: "0" };

export default function FichasAtendimentos() {
  const { data, loading, create, update, remove } = useCrud<Form>({ table: "attendance_forms" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Form | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (f: Form) => { setEditing(f); setForm({ name: f.name, fields_count: String(f.fields_count) }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, fields_count: parseInt(form.fields_count) || 0 };
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
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fichas de Atendimentos</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova ficha
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma ficha cadastrada.</div>
        ) : (
          <div className="space-y-2">
            {data.map(f => (
              <div key={f.id} className="stat-card !p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-foreground">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{f.fields_count} campos</span>
                  <button onClick={() => openEdit(f)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(f.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Ficha" : "Nova Ficha"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Qtd. de campos"><FormInput type="number" min={0} value={form.fields_count} onChange={e => set("fields_count", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
