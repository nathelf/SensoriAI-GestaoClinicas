import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, PenLine, CheckCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { gerarPdfAssinado, hashSeguranca } from "@/lib/gerarPdfAssinado";

interface Doc {
  id: string;
  title: string;
  document_type: string;
  content: string | null;
}

export default function AssinarPorToken() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const sigRef = useRef<SignatureCanvas>(null);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setError("Link inválido. Falta o token.");
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: err } = await supabase.functions.invoke("get-document-by-token", {
        body: { token },
      });
      if (err) {
        setError("Erro ao carregar documento.");
        setDoc(null);
      } else if ((data as { error?: string })?.error) {
        setError((data as { error: string }).error);
        setDoc(null);
      } else {
        setDoc((data as Doc) ?? null);
      }
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIpAddress(d?.ip || ""))
      .catch(() => setIpAddress(""));
  }, []);

  const clearSignature = () => sigRef.current?.clear();

  const handleSignAndSave = async () => {
    if (!doc || !token || !sigRef.current) return;
    const trimmed = sigRef.current.getTrimmedCanvas();
    const ctx = trimmed.getContext("2d");
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, trimmed.width, trimmed.height).data;
      const hasStroke = Array.from(imgData).some((v, i) => i % 4 === 3 && v > 10);
      if (!hasStroke) {
        toast.error("Desenhe sua assinatura antes de continuar.");
        return;
      }
    }
    const signatureDataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    setSaving(true);
    try {
      const { data: res, error: submitErr } = await supabase.functions.invoke("submit-signature", {
        body: {
          token,
          signatureBase64: signatureDataUrl,
          patientName: signerName.trim() || null,
          ip: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
      if (submitErr) throw submitErr;
      const signedId = (res as { signedId?: string })?.signedId;
      if (!signedId) throw new Error("Resposta inválida");

      const signedAt = new Date();
      const signedAtIso = signedAt.toISOString();
      const payloadHash = `${doc.content || ""}|${signedId}|${signedAtIso}`;
      const hash = await hashSeguranca(payloadHash);

      if (docRef.current) {
        const pdf = await gerarPdfAssinado(docRef.current, signatureDataUrl, {
          nome: signerName.trim() || "Signatário",
          data: signedAt.toLocaleString("pt-BR"),
          ip: ipAddress || "",
          docId: signedId,
          hash,
        });
        pdf.save(`documento_assinado_${signedId}.pdf`);
      }
      setSigned(true);
      toast.success("Documento assinado. Você pode baixar o PDF acima.");
    } catch (e: any) {
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
  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-4">
        <p className="text-muted-foreground text-center">{error || "Documento não encontrado."}</p>
        <p className="text-sm text-muted-foreground">O link pode ter expirado ou já ter sido utilizado.</p>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="rounded-2xl border border-border/40 bg-card p-6 max-w-md w-full text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">Documento assinado com sucesso</h2>
          <p className="text-sm text-muted-foreground mb-4">
            O PDF foi baixado automaticamente. Guarde-o para seus registros.
          </p>
          <p className="text-xs text-muted-foreground">
            Dados de auditoria (IP, data/hora e hash) constam no próprio PDF.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-foreground truncate flex-1" style={{ color: "#9b87f5" }}>
            {doc.title}
          </h1>
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
          <div className="p-3 border-b border-border/30">
            <span className="text-xs font-medium text-muted-foreground uppercase">Quem está assinando</span>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nome completo do signatário"
              className="w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#9b87f5]/30 outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-3 border-b border-border/30 bg-muted/30 flex items-center gap-2">
            <PenLine className="w-4 h-4" style={{ color: "#9b87f5" }} />
            <span className="text-xs font-medium text-muted-foreground uppercase">Assinatura</span>
          </div>
          <div className="p-4">
            <div className="rounded-xl border-2 border-dashed overflow-hidden touch-none" style={{ borderColor: "rgba(155,135,245,0.4)" }}>
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
            <button type="button" onClick={clearSignature} className="text-sm text-muted-foreground hover:text-foreground mt-2">
              Limpar
            </button>
          </div>
        </div>

        <button
          onClick={handleSignAndSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-white"
          style={{ backgroundColor: "#9b87f5" }}
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
