import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileUp } from "lucide-react";
import mammoth from "mammoth";
import { SkeletonDoc } from "@/components/SkeletonDoc";
import { gerarPdfRascunho } from "@/lib/gerarPdfAssinado";
import { toast } from "sonner";

const DOCUMENT_API_URL = import.meta.env.VITE_DOCUMENT_API_URL?.replace(/\/$/, "") || "";

type FileKind = "pdf" | "docx" | null;

interface UploadConversaoProps {
  onConteudoPronto?: (html: string, nomeArquivo: string) => void;
}

function downloadBlob(blob: Blob, defaultName: string, contentType: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultName;
  a.click();
  URL.revokeObjectURL(url);
}

export function UploadConversao({ onConteudoPronto }: UploadConversaoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKind, setFileKind] = useState<FileKind>(null);
  const [dragOver, setDragOver] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const accept = ".pdf,.docx";
  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  const reset = useCallback(() => {
    setFile(null);
    setFileKind(null);
    setProgress(0);
    setConverting(false);
  }, []);

  const setFileFromInput = useCallback((f: File | null) => {
    if (!f) {
      reset();
      return;
    }
    const ext = f.name.toLowerCase().endsWith(".pdf") ? "pdf" : f.name.toLowerCase().endsWith(".docx") ? "docx" : null;
    if (!ext || !allowedTypes.includes(f.type)) {
      toast.error("Envie apenas arquivos .pdf ou .docx");
      return;
    }
    setFile(f);
    setFileKind(ext);
  }, [reset]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) setFileFromInput(f);
    },
    [setFileFromInput]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      setFileFromInput(f ?? null);
      e.target.value = "";
    },
    [setFileFromInput]
  );

  const converterParaPdf = useCallback(async () => {
    if (!file || fileKind !== "docx") return;
    setConverting(true);
    setProgress(20);

    if (DOCUMENT_API_URL) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${DOCUMENT_API_URL}/convert/word-to-pdf`, {
          method: "POST",
          body: formData,
        });
        setProgress(80);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { detail?: string }).detail || res.statusText);
        }
        const blob = await res.blob();
        const outName = file.name.replace(/\.docx$/i, "") + ".pdf";
        const disposition = res.headers.get("Content-Disposition");
        const match = disposition?.match(/filename="?([^";]+)"?/);
        downloadBlob(blob, match?.[1] || outName, "application/pdf");
        setProgress(100);
        toast.success("PDF gerado pelo servidor e baixado.");
      } catch (err: any) {
        console.error(err);
        const isNetworkError =
          err?.name === "TypeError" &&
          (err?.message === "Failed to fetch" || err?.message?.includes("Load failed") || err?.message?.includes("NetworkError"));
        if (isNetworkError) {
          toast.error("Backend inacessível. Suba o servidor em backend/: uvicorn main:app --reload --port 8000. Usando conversão no navegador.");
        } else {
          toast.error(err?.message || "Erro no servidor de conversão. Usando conversão no navegador.");
        }
        setProgress(40);
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        setProgress(80);
        const titulo = file.name.replace(/\.docx$/i, "");
        const pdf = await gerarPdfRascunho(html, titulo);
        setProgress(100);
        pdf.save(`${titulo}.pdf`);
        toast.success("PDF gerado e baixado (navegador).");
        if (onConteudoPronto) onConteudoPronto(html, titulo);
      } finally {
        setConverting(false);
        setProgress(0);
      }
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      setProgress(80);
      const titulo = file.name.replace(/\.docx$/i, "");
      const pdf = await gerarPdfRascunho(html, titulo);
      setProgress(100);
      pdf.save(`${titulo}.pdf`);
      toast.success("PDF gerado e baixado.");
      if (onConteudoPronto) onConteudoPronto(html, titulo);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao converter. Verifique se o arquivo é um .docx válido.");
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [file, fileKind, onConteudoPronto]);

  const abrirNoEditor = useCallback(async () => {
    if (!file || fileKind !== "docx") return;
    setConverting(true);
    setProgress(20);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(60);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setProgress(100);
      if (onConteudoPronto) onConteudoPronto(result.value, file.name.replace(/\.docx$/i, ""));
      toast.success("Conteúdo carregado no editor.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ler o documento.");
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [file, fileKind, onConteudoPronto]);

  const converterParaWord = useCallback(async () => {
    if (!file || fileKind !== "pdf") return;

    if (!DOCUMENT_API_URL) {
      toast.error("Configure VITE_DOCUMENT_API_URL (backend Python) para converter PDF em Word.");
      return;
    }

    setConverting(true);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${DOCUMENT_API_URL}/convert/pdf-to-word`, {
        method: "POST",
        body: formData,
      });
      setProgress(80);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || res.statusText);
      }
      const blob = await res.blob();
      const outName = file.name.replace(/\.pdf$/i, "") + ".docx";
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      downloadBlob(blob, match?.[1] || outName, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      setProgress(100);
      toast.success("Word gerado e baixado.");
    } catch (err: any) {
      console.error(err);
      const isNetworkError =
        err?.name === "TypeError" &&
        (err?.message === "Failed to fetch" || err?.message?.includes("Load failed") || err?.message?.includes("NetworkError"));
      const msg = isNetworkError
        ? "Não foi possível conectar ao backend. Suba o servidor Python em backend/ com: uvicorn main:app --reload --port 8000"
        : err?.message ||
          (typeof err?.detail === "string" ? err.detail : undefined) ||
          "Erro ao converter PDF em Word. Verifique se o backend está rodando e se o PDF é válido.";
      toast.error(msg);
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [file, fileKind]);

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      <div className="p-3 border-b border-border/30 bg-muted/30 flex items-center gap-2">
        <FileUp className="w-4 h-4 text-[#9b87f5]" />
        <span className="text-xs font-medium text-muted-foreground uppercase">Upload e conversão</span>
      </div>
      <div className="p-4 space-y-3">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${dragOver ? "border-[#9b87f5] bg-[#9b87f5]/5" : "border-[#9b87f5]/40 bg-white dark:bg-card"}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={onFileInputChange}
            className="hidden"
            id="upload-doc-conversao"
          />
          <label htmlFor="upload-doc-conversao" className="cursor-pointer block">
            {file ? (
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-[#9b87f5]" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">({fileKind === "pdf" ? "PDF" : "Word"})</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Arraste um arquivo <strong>.pdf</strong> ou <strong>.docx</strong> aqui ou clique para selecionar
              </p>
            )}
          </label>
        </div>

        {file && (
          <>
            <AnimatePresence mode="wait">
              {converting ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <SkeletonDoc progress={progress} status="Convertendo..." />
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="flex flex-wrap gap-2">
              {fileKind === "docx" && (
                <>
                  <motion.button
                    type="button"
                    onClick={abrirNoEditor}
                    disabled={converting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 rounded-xl border border-[#9b87f5]/40 text-[#9b87f5] text-sm font-medium hover:bg-[#9b87f5]/10 hover:shadow-[0_0_12px_rgba(155,135,245,0.25)] disabled:opacity-50 transition-shadow"
                  >
                    Abrir no editor
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={converterParaPdf}
                    disabled={converting}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(155,135,245,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 rounded-xl bg-[#9b87f5] text-white text-sm font-medium hover:opacity-95 disabled:opacity-50"
                  >
                    Converter para PDF
                  </motion.button>
                </>
              )}
              {fileKind === "pdf" && (
                <motion.button
                  type="button"
                  onClick={converterParaWord}
                  disabled={converting}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(155,135,245,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-2 rounded-xl bg-[#9b87f5] text-white text-sm font-medium hover:opacity-95 disabled:opacity-50"
                >
                  Converter para Word
                </motion.button>
              )}
              <motion.button
                type="button"
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-2 rounded-xl border border-border/40 text-muted-foreground text-sm hover:bg-muted"
              >
                Limpar
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
