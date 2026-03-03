import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Category {
  id: string;
  name: string;
  category_type: string;
}

export default function CategoriasContas() {
  const { data, loading, create, update, remove } = useCrud<Category>({ table: "financial_categories" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<"receita" | "despesa">("despesa");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setName(""); setCategoryType("despesa"); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setCategoryType(c.category_type as "receita" | "despesa"); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) await update(editing.id, { name, category_type: categoryType });
    else await create({ name, category_type: categoryType } as any);
    setSaving(false);
    setModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Categorias de Contas</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova categoria
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
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${c.category_type === "receita" ? "bg-success/20 text-success-foreground" : "bg-destructive/20 text-destructive-foreground"}`}>
                    {c.category_type === "receita" ? "Receita" : "Despesa"}
                  </span>
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
        <FormField label="Tipo *">
          <FormSelect value={categoryType} onChange={e => setCategoryType(e.target.value as "receita" | "despesa")}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </FormSelect>
        </FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
