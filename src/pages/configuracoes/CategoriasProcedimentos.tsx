import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Category {
  id: string;
  name: string;
}

export default function CategoriasProcedimentos() {
  const { data, loading, create, update, remove } = useCrud<Category>({ table: "procedure_categories" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setName(""); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) await update(editing.id, { name });
    else await create({ name } as any);
    setSaving(false);
    setModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Categorias de Procedimentos</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma categoria cadastrada.</div>
        ) : (
          <div className="space-y-2">
            {data.map(c => (
              <div key={c.id} className="stat-card !p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Categoria" : "Nova Categoria"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={name} onChange={e => setName(e.target.value)} required /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
