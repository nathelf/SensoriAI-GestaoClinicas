import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Pencil, Trash2, Sparkles, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CLINIC_TEMPLATES, DOCUMENT_TYPES, type ClinicTemplate } from "@/lib/templates/clinicTemplates";

interface Doc {
  id: string;
  title: string;
  document_type: string;
  content: string | null;
  active: boolean;
  is_template?: boolean;
}

const empty = { title: "", document_type: "termo", content: "" };

export default function CliniDocs() {
  const navigate = useNavigate();
  const { data, loading, create, update, remove } = useCrud<Doc>({ table: "clinic_documents" });
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setPickerOpen(true);
  };

  const openEdit = (d: Doc) => {
    setEditing(d);
    setForm({
      title: d.title,
      document_type: d.document_type,
      content: d.content || "",
    });
    setSaveAsTemplate(!!d.is_template);
    setModalOpen(true);
  };

  const applyTemplate = (t: ClinicTemplate | null) => {
    setPickerOpen(false);
    if (t) {
      setForm({
        title: t.titulo,
        document_type: t.tipo,
        content: t.conteudo,
      });
    } else {
      setForm(empty);
    }
    setModalOpen(true);
  };

  const openBlank = () => applyTemplate(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      document_type: form.document_type,
      content: form.content || null,
      is_template: saveAsTemplate,
    };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generateWithAI = async () => {
    if (!form.title.trim()) {
      toast.error("Informe o título antes de gerar com IA.");
      return;
    }
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-document", {
        body: { titulo: form.title, tipo: form.document_type },
      });
      if (error) throw error;
      const content = (result as { content?: string })?.content;
      if (content) setForm((f) => ({ ...f, content }));
      else toast.error("Resposta vazia da IA.");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao gerar com IA. Verifique se a Edge Function e GEMINI_API_KEY estão configuradas.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Documentos e Termos</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo Documento
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum documento cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.id} className="stat-card !p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.document_type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.is_template && (
                    <span className="text-xs px-2 py-1 rounded-lg font-medium bg-primary/20 text-primary">Modelo</span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-medium ${d.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {d.active ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    onClick={() => navigate(`/documentos/assinatura/${d.id}`)}
                    className="p-2 rounded-lg hover:bg-muted"
                    title="Enviar para assinatura"
                  >
                    <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-muted">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} className="p-2 rounded-lg hover:bg-destructive/20">
                    <Trash2 className="w-3.5 h-3.5 text-destructive-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal: Escolher modelo ou em branco */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border/40 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-3">Novo Documento</h3>
            <p className="text-sm text-muted-foreground mb-3">Escolha um modelo sugerido ou comece em branco.</p>
            <ul className="space-y-2">
              {CLINIC_TEMPLATES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="w-full text-left px-3 py-2.5 rounded-xl border border-border/40 hover:bg-muted/50 text-sm font-medium text-foreground"
                  >
                    {t.titulo}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openBlank}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-border/40 hover:bg-muted/50 text-sm text-muted-foreground"
                >
                  Em branco
                </button>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Ou abra em branco e use &quot;Gerar com IA&quot; no editor.</p>
          </div>
        </div>
      )}

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Documento" : "Novo Documento"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Título *">
          <FormInput value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <FormField label="Tipo">
          <FormSelect value={form.document_type} onChange={(e) => set("document_type", e.target.value)}>
            {DOCUMENT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Conteúdo">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">HTML com placeholders {{nome_paciente}}, {{data}}, {{cpf}}, {{procedimento}}, {{nome_profissional}}</span>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={generating}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" /> {generating ? "Gerando..." : "Gerar com IA"}
              </button>
            </div>
            <FormTextarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={10}
              className="min-h-[120px]"
              placeholder="Conteúdo do documento em HTML..."
            />
          </div>
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="rounded border-border/40 text-primary focus:ring-primary/30"
          />
          <span className="text-sm text-muted-foreground">Salvar como Modelo (reutilizar em novos documentos)</span>
        </label>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
