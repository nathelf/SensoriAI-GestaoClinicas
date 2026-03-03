import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { UploadConversao } from "@/components/UploadConversao";

const DOCUMENT_API_URL = import.meta.env.VITE_DOCUMENT_API_URL?.replace(/\/$/, "") || "";

export default function DocumentosConversor() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-2">Conversor de Documentos</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Envie arquivos PDF ou Word para converter. Mais ferramentas de conversão serão adicionadas aqui.
        </p>
        {!DOCUMENT_API_URL && (
          <div className="mb-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Conversão PDF ↔ Word requer o backend Python</p>
              <p className="text-amber-700 dark:text-amber-300 mb-2">
                No <code className="bg-amber-100 dark:bg-muted px-1 rounded">.env</code> na raiz do projeto, adicione:
              </p>
              <pre className="text-xs bg-white dark:bg-muted/50 p-2 rounded border border-amber-200 dark:border-amber-800 overflow-x-auto">
                VITE_DOCUMENT_API_URL="http://localhost:8000"
              </pre>
              <p className="text-amber-700 dark:text-amber-300 mt-2">
                Depois suba o backend em <code className="bg-amber-100 dark:bg-muted px-1 rounded">backend/</code> com{" "}
                <code className="bg-amber-100 dark:bg-muted px-1 rounded">uvicorn main:app --reload --port 8000</code> e reinicie o <code className="bg-amber-100 dark:bg-muted px-1 rounded">npm run dev</code>.
              </p>
            </div>
          </div>
        )}
        <UploadConversao
          onConteudoPronto={(html, nomeArquivo) => {
            navigate("/clinidocs", { state: { abrirEditor: { content: html, title: nomeArquivo } } });
          }}
        />
      </motion.div>
    </div>
  );
}
