import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const empty = { name: "", email: "", phone: "", source: "", notes: "", status: "novo" };

export default function Leads() {
  const { data, loading, create, update, remove } = useCrud<Lead>({ table: "leads", orderBy: "created_at", ascending: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (l: Lead) => {
    setEditing(l);
    setForm({ name: l.name, email: l.email || "", phone: l.phone || "", source: l.source || "", notes: l.notes || "", status: l.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, source: form.source || null, notes: form.notes || null, status: form.status };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Leads</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo lead
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum lead cadastrado.</div>
        ) : (
          <div className="space-y-3">
            {data.map(l => (
              <div key={l.id} className="stat-card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.source || "—"} · {l.phone || l.email || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(l.created_at)}</span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground capitalize">{l.status}</span>
                  <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(l.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Lead" : "Novo Lead"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Telefone"><FormInput value={form.phone} onChange={e => set("phone", e.target.value)} /></FormField>
        <FormField label="E-mail"><FormInput type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormField>
        <FormField label="Origem"><FormSelect value={form.source} onChange={e => set("source", e.target.value)}>
          <option value="">—</option>
          <option value="Instagram">Instagram</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Site">Site</option>
          <option value="Indicação">Indicação</option>
          <option value="Outro">Outro</option>
        </FormSelect></FormField>
        <FormField label="Status"><FormSelect value={form.status} onChange={e => set("status", e.target.value)}>
          <option value="novo">Novo</option>
          <option value="contato">Em contato</option>
          <option value="qualificado">Qualificado</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </FormSelect></FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
