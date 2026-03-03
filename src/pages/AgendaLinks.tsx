import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Plus, Pencil, Trash2, Copy } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

interface BookingLink {
  id: string;
  title: string;
  url: string;
  link_type: string | null;
}

const empty = { title: "", url: "", link_type: "agendamento" };

export default function AgendaLinks() {
  const { data, loading, create, update, remove } = useCrud<BookingLink>({ table: "booking_links" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingLink | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (l: BookingLink) => { setEditing(l); setForm({ title: l.title, url: l.url, link_type: l.link_type || "agendamento" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title: form.title, url: form.url, link_type: form.link_type || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Links de Agendamento</h1>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo link
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum link cadastrado. Crie um para compartilhar.</div>
        ) : (
          <div className="space-y-3">
            {data.map(l => (
              <div key={l.id} className="stat-card !p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{l.title}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <input readOnly value={l.url} className="flex-1 min-w-0 px-2 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground truncate" />
                      <button type="button" onClick={() => copyUrl(l.url)} className="p-2 rounded-lg hover:bg-primary/10 shrink-0">
                        <Copy className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(l.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Link" : "Novo Link"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Título *"><FormInput value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Agendamento Online" required /></FormField>
        <FormField label="URL *"><FormInput value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." required /></FormField>
        <FormField label="Tipo">
          <FormSelect value={form.link_type} onChange={e => set("link_type", e.target.value)}>
            <option value="agendamento">Agendamento</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
          </FormSelect>
        </FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
