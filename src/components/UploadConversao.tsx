import { useState, useCallback } from "react";
import { FileText, FileUp, Loader2 } from "lucide-react";
import mammoth from "mammoth";
import { Progress } from "@/components/ui/progress";
import { gerarPdfRascunho } from "@/lib/gerarPdfAssinado";
import { toast } from "sonner";

type FileKind = "pdf" | "docx" | null;

interface UploadConversaoProps {
  onConteudoPronto?: (html: string, nomeArquivo: string) => void;
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
    setProgress(10);
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

  const converterParaWord = useCallback(() => {
    if (fileKind === "pdf") {
      toast.info("Conversão PDF → Word em breve. Por enquanto use um .docx para editar e gerar PDF.");
    }
  }, [fileKind]);

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
            {converting && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2 [&>div]:bg-[#9b87f5]" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Convertendo...
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {fileKind === "docx" && (
                <>
                  <button
                    type="button"
                    onClick={abrirNoEditor}
                    disabled={converting}
                    className="px-3 py-2 rounded-xl border border-[#9b87f5]/40 text-[#9b87f5] text-sm font-medium hover:bg-[#9b87f5]/10 disabled:opacity-50"
                  >
                    Abrir no editor
                  </button>
                  <button
                    type="button"
                    onClick={converterParaPdf}
                    disabled={converting}
                    className="px-3 py-2 rounded-xl bg-[#9b87f5] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Converter para PDF
                  </button>
                </>
              )}
              {fileKind === "pdf" && (
                <button
                  type="button"
                  onClick={converterParaWord}
                  disabled={converting}
                  className="px-3 py-2 rounded-xl bg-[#9b87f5] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Converter para Word
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="px-3 py-2 rounded-xl border border-border/40 text-muted-foreground text-sm hover:bg-muted"
              >
                Limpar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
