import { useState } from "react";
import { motion } from "framer-motion";
import { UserCog, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
}

const empty = { name: "", specialty: "", document: "", email: "", phone: "" };

export default function Profissionais() {
  const { data, loading, create, update, remove } = useCrud<Professional>({ table: "professionals" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Professional) => {
    setEditing(p);
    setForm({ name: p.name, specialty: p.specialty || "", document: p.document || "", email: p.email || "", phone: p.phone || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, specialty: form.specialty || null, document: form.document || null, email: form.email || null, phone: form.phone || null };
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
            <UserCog className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Profissionais</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum profissional cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {data.map(p => (
              <div key={p.id} className="stat-card !p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{p.name.charAt(0)}{p.name.split(" ").pop()?.charAt(0) || ""}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.specialty || "—"} {p.document ? `· ${p.document}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${p.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{p.active ? "Ativo" : "Inativo"}</span>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Profissional" : "Novo Profissional"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Especialidade"><FormInput value={form.specialty} onChange={e => set("specialty", e.target.value)} placeholder="Ex: Harmonização Facial" /></FormField>
        <FormField label="CRM / CRBM"><FormInput value={form.document} onChange={e => set("document", e.target.value)} placeholder="Ex: CRM 12345" /></FormField>
        <FormField label="E-mail"><FormInput type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormField>
        <FormField label="Telefone"><FormInput value={form.phone} onChange={e => set("phone", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
