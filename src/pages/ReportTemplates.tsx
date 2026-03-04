import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReportTemplates } from '@/hooks/useReportTemplates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReportTemplates() {
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate } = useReportTemplates();

  const handleUseTemplate = (
    structure: { nodes: unknown[]; edges: unknown[] },
    config?: Record<string, unknown> | null
  ) => {
    navigate('/relatorios-ia', { state: { loadTemplate: structure, templateConfig: config } });
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Modelos de Relatório</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seus templates salvos. Clique em &quot;Usar Este&quot; para carregar no canvas.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum modelo salvo</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie um layout no Relatórios Dinâmicos e clique em &quot;Salvar como Modelo&quot;
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate('/relatorios-ia')}
          >
            Ir para Relatórios Dinâmicos
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(t.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(t.structure?.nodes?.length || 0)} blocos • {(t.structure?.edges?.length || 0)} conexões
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (window.confirm('Excluir este modelo?')) {
                      deleteTemplate(t.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="w-full mt-4"
                size="sm"
                onClick={() => handleUseTemplate(t.structure, t.config)}
              >
                Usar Este
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
