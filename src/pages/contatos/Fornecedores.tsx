import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
}

const empty = { name: "", email: "", phone: "", document: "", address: "", notes: "" };

export default function Fornecedores() {
  const { data, loading, create, update, remove } = useCrud<Supplier>({ table: "suppliers" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", document: s.document || "", address: s.address || "", notes: s.notes || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, document: form.document || null, address: form.address || null, notes: form.notes || null };
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
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fornecedores</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum fornecedor cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {data.map(s => (
              <div key={s.id} className="stat-card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.phone || s.email || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${s.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{s.active ? "Ativo" : "Inativo"}</span>
                  <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Fornecedor" : "Novo Fornecedor"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Telefone"><FormInput value={form.phone} onChange={e => set("phone", e.target.value)} /></FormField>
        <FormField label="E-mail"><FormInput type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormField>
        <FormField label="CNPJ/CPF"><FormInput value={form.document} onChange={e => set("document", e.target.value)} /></FormField>
        <FormField label="Endereço"><FormInput value={form.address} onChange={e => set("address", e.target.value)} /></FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
