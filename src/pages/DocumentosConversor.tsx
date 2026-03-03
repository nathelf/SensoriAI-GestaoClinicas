import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadConversao } from "@/components/UploadConversao";

export default function DocumentosConversor() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-2">Conversor de Documentos</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Envie arquivos PDF ou Word para converter. Mais ferramentas de conversão serão adicionadas aqui.
        </p>
        <UploadConversao
          onConteudoPronto={(html, nomeArquivo) => {
            navigate("/clinidocs", { state: { abrirEditor: { content: html, title: nomeArquivo } } });
          }}
        />
      </motion.div>
    </div>
  );
}
