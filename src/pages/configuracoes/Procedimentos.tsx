import { useState } from "react";
import { motion } from "framer-motion";
import { Syringe, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Procedure { id: string; name: string; description: string | null; category_id: string | null; duration_minutes: number; price: number; cost: number; active: boolean; }
interface Category { id: string; name: string; }

const empty = { name: "", description: "", duration_minutes: "60", price: "0", cost: "0", category_id: "" };

export default function Procedimentos() {
  const { data, loading, create, update, remove } = useCrud<Procedure>({ table: "procedures" });
  const { data: categories } = useCrud<Category>({ table: "procedure_categories" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Procedure) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", duration_minutes: String(p.duration_minutes), price: String(p.price), cost: String(p.cost), category_id: p.category_id || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { name: form.name, description: form.description || null, duration_minutes: parseInt(form.duration_minutes), price: parseFloat(form.price), cost: parseFloat(form.cost), category_id: form.category_id || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false); setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name || "Sem categoria";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Syringe className="w-5 h-5 text-primary" /><h1 className="text-xl font-bold text-foreground">Procedimentos</h1></div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Novo</button>
        </div>
        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        data.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhum procedimento cadastrado.</div> :
        <div className="space-y-2">
          {data.map(p => (
            <div key={p.id} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{catName(p.category_id)} · {p.duration_minutes}min</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">R$ {Number(p.price).toFixed(2)}</span>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            </div>
          ))}
        </div>}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Procedimento" : "Novo Procedimento"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Categoria">
          <FormSelect value={form.category_id} onChange={e => set("category_id", e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormSelect>
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Duração (min)"><FormInput type="number" value={form.duration_minutes} onChange={e => set("duration_minutes", e.target.value)} /></FormField>
          <FormField label="Preço (R$)"><FormInput type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} /></FormField>
          <FormField label="Custo (R$)"><FormInput type="number" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} /></FormField>
        </div>
        <FormField label="Descrição"><FormTextarea value={form.description} onChange={e => set("description", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
