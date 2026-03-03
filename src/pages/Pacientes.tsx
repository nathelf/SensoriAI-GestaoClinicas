import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  source: string;
  tags: string[];
  active: boolean;
  created_at: string;
}

const emptyPatient = { name: "", email: "", phone: "", cpf: "", birth_date: "", gender: "", address: "", city: "", state: "", zip_code: "", notes: "", source: "manual" };

export default function Pacientes() {
  const { data, loading, create, update, remove } = useCrud<Patient>({ table: "patients" });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyPatient);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search) || p.email?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm(emptyPatient); setModalOpen(true); };
  const openEdit = (p: Patient) => {
    setEditing(p);
    setForm({ name: p.name, email: p.email || "", phone: p.phone || "", cpf: p.cpf || "", birth_date: p.birth_date || "", gender: p.gender || "", address: p.address || "", city: p.city || "", state: p.state || "", zip_code: p.zip_code || "", notes: p.notes || "", source: p.source });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) await update(editing.id, form);
    else await create(form as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Pacientes</h1>
          <button onClick={openCreate} className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px]">
            <Plus className="w-4 h-4" /> Novo Paciente
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente..." className="w-full pl-9 pr-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum paciente encontrado. Clique em "Novo Paciente" para adicionar.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="stat-card flex items-center gap-3 !p-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.phone || "Sem telefone"} {p.email ? `· ${p.email}` : ""}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Paciente" : "Novo Paciente"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Telefone"><FormInput value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" /></FormField>
          <FormField label="E-mail"><FormInput type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="CPF"><FormInput value={form.cpf} onChange={e => set("cpf", e.target.value)} /></FormField>
          <FormField label="Data de Nascimento"><FormInput type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} /></FormField>
        </div>
        <FormField label="Gênero">
          <FormSelect value={form.gender} onChange={e => set("gender", e.target.value)}>
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="outro">Outro</option>
          </FormSelect>
        </FormField>
        <FormField label="Endereço"><FormInput value={form.address} onChange={e => set("address", e.target.value)} /></FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Cidade"><FormInput value={form.city} onChange={e => set("city", e.target.value)} /></FormField>
          <FormField label="Estado"><FormInput value={form.state} onChange={e => set("state", e.target.value)} /></FormField>
          <FormField label="CEP"><FormInput value={form.zip_code} onChange={e => set("zip_code", e.target.value)} /></FormField>
        </div>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
