import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Sparkles,
  MoreVertical,
  Eye,
  Edit3,
  PenTool,
  FileDown,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { EditorWysiwyg } from "@/components/EditorWysiwyg";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CLINIC_TEMPLATES, DOCUMENT_TYPES, type ClinicTemplate } from "@/lib/templates/clinicTemplates";
import { gerarPdfRascunho } from "@/lib/gerarPdfAssinado";

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
  const location = useLocation();
  const { user } = useAuth();
  const { data, loading, create, update, remove } = useCrud<Doc>({ table: "clinic_documents" });
  const [signedDocIds, setSignedDocIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [linkModal, setLinkModal] = useState<Doc | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  useEffect(() => {
    if (!data.length) return;
    (async () => {
      const { data: signed } = await supabase
        .from("signed_documents")
        .select("document_id")
        .not("document_id", "is", null);
      const ids = new Set((signed || []).map((s: { document_id: string }) => s.document_id).filter(Boolean));
      setSignedDocIds(ids);
    })();
  }, [data]);

  // Abrir editor com conteúdo vindo do Conversor de Documentos
  useEffect(() => {
    const state = location.state as { abrirEditor?: { content: string; title: string } } | undefined;
    if (!state?.abrirEditor) return;
    setForm((f) => ({
      ...f,
      title: state.abrirEditor.title,
      content: state.abrirEditor.content,
    }));
    setEditing(null);
    setModalOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

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
      toast.error(
        err?.message || "Erro ao gerar com IA. Verifique se a Edge Function e GEMINI_API_KEY estão configuradas."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGerarLinkAssinatura = async (d: Doc) => {
    if (!user) return;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("signature_links").insert({
      user_id: user.id,
      document_id: d.id,
      token,
      expires_at: expiresAt,
    });
    if (error) {
      toast.error("Erro ao gerar link.");
      return;
    }
    const url = `${window.location.origin}/assinar?token=${token}`;
    setGeneratedLink(url);
    setLinkModal(d);
    toast.success("Link criado. Válido por 48 horas.");
  };

  const copiarLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link copiado.");
    }
  };

  const handleBaixarPdf = async (d: Doc) => {
    setDownloadingPdf(d.id);
    try {
      const pdf = await gerarPdfRascunho(d.content || "", d.title);
      pdf.save(`Documento-${d.title.replace(/[^a-z0-9]/gi, "-")}.pdf`);
      toast.success("PDF baixado.");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setDownloadingPdf(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Documentos e Termos</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5 bg-[#9b87f5] text-white hover:opacity-90"
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
            {data.map((d) => {
              const isAssinado = signedDocIds.has(d.id);
              return (
                <div
                  key={d.id}
                  className="stat-card !p-4 flex items-center gap-3 rounded-xl border border-border/40"
                >
                  <FileText className="w-5 h-5 text-[#9b87f5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{d.document_type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {d.is_template && (
                      <span className="text-xs px-2 py-1 rounded-lg font-medium bg-muted text-muted-foreground">
                        Modelo
                      </span>
                    )}
                    {isAssinado ? (
                      <span className="text-xs px-2 py-1 rounded-lg font-medium bg-green-500/20 text-green-700 dark:text-green-400">
                        Assinado
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-lg font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        Pendente
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-lg font-medium ${d.active ? "bg-green-600/20 text-green-800 dark:text-green-300" : "bg-muted text-muted-foreground"}`}
                    >
                      {d.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-muted data-[state=open]:bg-muted outline-none">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => setPreviewDoc(d)}
                        className="flex items-center gap-2 rounded-lg"
                      >
                        <Eye className="w-4 h-4" /> Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEdit(d)}
                        className="flex items-center gap-2 rounded-lg text-foreground"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" /> Editar Modelo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/documentos/assinatura/${d.id}`)}
                        className="flex items-center gap-2 rounded-lg"
                      >
                        <PenTool className="w-4 h-4 text-[#9b87f5]" /> Assinar agora
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleGerarLinkAssinatura(d)}
                        className="flex items-center gap-2 rounded-lg"
                      >
                        <PenTool className="w-4 h-4 text-[#9b87f5]" /> Gerar link para assinatura
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBaixarPdf(d)}
                        disabled={downloadingPdf === d.id}
                        className="flex items-center gap-2 rounded-lg"
                      >
                        <FileDown className="w-4 h-4" />{" "}
                        {downloadingPdf === d.id ? "Gerando..." : "Baixar PDF"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(d.id)}
                        className="flex items-center gap-2 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
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
            <h3 className="text-lg font-bold text-foreground mb-3">Seleção de Modelo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Escolha um modelo sugerido ou comece em branco. Placeholders: {`{{nome}}, {{data}}, {{cpf}}, {{historico}}`}
            </p>
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
            <p className="text-xs text-muted-foreground mt-3">Ou use &quot;Gerar com IA&quot; no editor.</p>
          </div>
        </div>
      )}

      {/* Modal: Visualizar documento */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h3 className="text-lg font-bold text-foreground">{previewDoc.title}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div
              className="p-4 overflow-y-auto flex-1 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground text-foreground"
              dangerouslySetInnerHTML={{ __html: previewDoc.content || "<p>Sem conteúdo.</p>" }}
            />
          </div>
        </div>
      )}

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Documento" : "Novo Documento"}
        onSubmit={handleSubmit}
        loading={saving}
        size="large"
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
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Edite o texto abaixo. Placeholders: {`{{nome_paciente}}, {{data}}, {{cpf}}, {{procedimento}}`}
              </span>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={generating}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#9b87f5]/15 text-[#9b87f5] text-xs font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" /> {generating ? "Gerando..." : "Gerar com IA"}
              </button>
            </div>
            <EditorWysiwyg
              value={form.content}
              onChange={(v) => set("content", v)}
              minHeight="220px"
            />
          </div>
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="rounded border-border/40 text-[#9b87f5] focus:ring-[#9b87f5]/30"
          />
          <span className="text-sm text-muted-foreground">Salvar como Modelo (reutilizar em novos documentos)</span>
        </label>
      </CrudModal>

      {/* Modal: Link para assinatura */}
      {linkModal && generatedLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={() => { setLinkModal(null); setGeneratedLink(null); }}
        >
          <div
            className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border/40 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-2">Link para assinatura</h3>
            <p className="text-sm text-muted-foreground mb-2">Envie este link ao paciente. Válido por 48 horas.</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={generatedLink}
                className="flex-1 px-3 py-2 rounded-xl border border-border/40 bg-muted/30 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={copiarLink}
                className="px-4 py-2 rounded-xl bg-[#9b87f5] text-white text-sm font-medium"
              >
                Copiar
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setLinkModal(null); setGeneratedLink(null); }}
              className="mt-3 w-full py-2 rounded-xl border border-border/40 text-sm text-muted-foreground"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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
