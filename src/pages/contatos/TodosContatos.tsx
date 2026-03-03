import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_type: string;
  notes: string | null;
}

const empty = { name: "", email: "", phone: "", contact_type: "outro", notes: "" };
const TIPOS = [
  { value: "paciente", label: "Paciente" },
  { value: "profissional", label: "Profissional" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "lead", label: "Lead" },
  { value: "outro", label: "Outro" },
];

export default function TodosContatos() {
  const { data, loading, create, update, remove } = useCrud<Contact>({ table: "contacts" });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", contact_type: c.contact_type, notes: c.notes || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, email: form.email || null, phone: form.phone || null, contact_type: form.contact_type, notes: form.notes || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const tipoLabel = (t: string) => TIPOS.find(x => x.value === t)?.label || t;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Todos os Contatos</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum contato encontrado.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <div key={c.id} className="stat-card !p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{c.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone || c.email || "—"}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground shrink-0">{tipoLabel(c.contact_type)}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Contato" : "Novo Contato"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Telefone"><FormInput value={form.phone} onChange={e => set("phone", e.target.value)} /></FormField>
        <FormField label="E-mail"><FormInput type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormField>
        <FormField label="Tipo">
          <FormSelect value={form.contact_type} onChange={e => set("contact_type", e.target.value)}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </FormSelect>
        </FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
