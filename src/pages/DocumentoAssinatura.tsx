import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, PenLine } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { gerarPdfAssinado, hashSeguranca } from "@/lib/gerarPdfAssinado";

interface Doc {
  id: string;
  title: string;
  document_type: string;
  content: string | null;
}

export default function DocumentoAssinatura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markTaskDone } = useOnboarding();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const sigRef = useRef<SignatureCanvas>(null);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data: row, error } = await supabase
        .from("clinic_documents")
        .select("id, title, document_type, content")
        .eq("id", id)
        .single();
      if (error || !row) {
        toast.error("Documento não encontrado.");
        setDoc(null);
      } else setDoc(row as Doc);
      setLoading(false);
    })();
  }, [id, user]);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIpAddress(d?.ip || ""))
      .catch(() => setIpAddress(""));
  }, []);

  const clearSignature = () => sigRef.current?.clear();

  const handleSignAndSave = async () => {
    if (!doc || !user || !sigRef.current) return;
    const trimmed = sigRef.current.getTrimmedCanvas();
    const ctx = trimmed.getContext("2d");
    if (ctx) {
      const w = trimmed.width;
      const h = trimmed.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;
      const hasStroke = Array.from(imgData).some((v, i) => i % 4 === 3 && v > 10);
      if (!hasStroke) {
        toast.error("Desenhe sua assinatura antes de continuar.");
        return;
      }
    }
    const signatureDataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const signedAt = new Date();
    const signedAtIso = signedAt.toISOString();

    setSaving(true);
    try {
      const { data: inserted, error } = await supabase
        .from("signed_documents")
        .insert({
          user_id: user.id,
          document_id: doc.id,
          patient_name: signerName.trim() || null,
          original_content: doc.content || "",
          signature_image_base64: signatureDataUrl,
          signed_at: signedAtIso,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          status: "SIGNED",
        })
        .select("id")
        .single();

      if (error) throw error;
      const signedIdNew = (inserted as { id: string }).id;
      await markTaskDone("documento");

      const payloadHash = `${doc.content || ""}|${signedIdNew}|${signedAtIso}`;
      const hash = await hashSeguranca(payloadHash);

      if (!docRef.current) {
        toast.error("Erro ao gerar PDF: elemento do documento não encontrado.");
        setSaving(false);
        return;
      }

      const pdf = await gerarPdfAssinado(docRef.current, signatureDataUrl, {
        nome: signerName.trim() || "Signatário",
        data: signedAt.toLocaleString("pt-BR"),
        ip: ipAddress || "",
        docId: signedIdNew,
        hash,
      });
      pdf.save(`documento_assinado_${signedIdNew}.pdf`);
      toast.success("Documento assinado e PDF baixado.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar assinatura.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Carregando documento...</p>
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-4">
        <p className="text-muted-foreground">Documento não encontrado.</p>
        <button onClick={() => navigate("/clinidocs")} className="text-primary font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/clinidocs")}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground truncate flex-1">{doc.title}</h1>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-3 border-b border-border/30 bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase">Visualização do documento</span>
          </div>
          <div
            ref={docRef}
            id="documento-para-pdf"
            className="p-4 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground text-foreground overflow-x-auto bg-white"
            style={{ fontFamily: "Arial, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: doc.content || "<p>Sem conteúdo.</p>" }}
          />
        </div>

        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-3 border-b border-border/30 bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase">Quem está assinando</span>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nome completo do signatário"
              className="w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-3 border-b border-border/30 bg-muted/30 flex items-center gap-2">
            <PenLine className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Assinatura</span>
          </div>
          <div className="p-4">
            <div className="rounded-xl border-2 border-dashed border-primary/40 bg-muted/20 overflow-hidden touch-none">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  className: "w-full h-40 touch-none",
                  style: { width: "100%", height: 160 },
                }}
                backgroundColor="transparent"
                penColor="#9b87f5"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignAndSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {saving ? "Salvando e gerando PDF..." : "Assinar e baixar PDF"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Ao assinar, são registrados data/hora, IP e navegador para fins de comprovação.
        </p>
      </motion.div>
    </div>
  );
}
