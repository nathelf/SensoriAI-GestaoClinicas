import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Doc {
  id: string;
  title: string;
  document_type: string;
  content: string | null;
  active: boolean;
}

const empty = { title: "", document_type: "termo", content: "" };

export default function CliniDocs() {
  const { data, loading, create, update, remove } = useCrud<Doc>({ table: "clinic_documents" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (d: Doc) => { setEditing(d); setForm({ title: d.title, document_type: d.document_type, content: d.content || "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title: form.title, document_type: form.document_type, content: form.content || null };
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
          <h1 className="text-xl font-bold text-foreground">Documentos e Termos</h1>
          <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Documento
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum documento cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map(d => (
              <div key={d.id} className="stat-card !p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.document_type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${d.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{d.active ? "Ativo" : "Inativo"}</span>
                  <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Documento" : "Novo Documento"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Título *"><FormInput value={form.title} onChange={e => set("title", e.target.value)} required /></FormField>
        <FormField label="Tipo">
          <FormSelect value={form.document_type} onChange={e => set("document_type", e.target.value)}>
            <option value="termo">Termo</option>
            <option value="contrato">Contrato</option>
            <option value="atestado">Atestado</option>
            <option value="prescricao">Prescrição</option>
          </FormSelect>
        </FormField>
        <FormField label="Conteúdo"><FormTextarea value={form.content} onChange={e => set("content", e.target.value)} rows={4} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
