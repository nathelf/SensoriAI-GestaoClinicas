import React, { useRef } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportConfig } from '@/hooks/useReportConfig';

interface ReportConfigModalProps {
  config: ReportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;
}

export function ReportConfigModal({ config, setConfig }: ReportConfigModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Configurar modelo do relatório">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Configurar Relatório PDF</DialogTitle>
          <DialogDescription className="sr-only">
            Ajuste logo, título, rodapé e layout do relatório gerado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Logo da Clínica */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo da Clínica</Label>
            <div className="flex items-center gap-3">
              {config.logoDataUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={config.logoDataUrl}
                    alt="Logo"
                    className="h-12 w-auto max-w-[120px] object-contain rounded border border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfig((p) => ({ ...p, logoDataUrl: '' }))}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Carregar logo
                </Button>
              )}
              <input
                ref={fileInputRef}
                id="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          {/* Título Personalizado */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Relatório</Label>
            <Input
              id="titulo"
              placeholder="Ex: Relatório de Performance Mensal"
              value={config.titulo}
              onChange={(e) => setConfig((p) => ({ ...p, titulo: e.target.value }))}
            />
          </div>

          {/* Dados da Unidade */}
          <div className="space-y-2">
            <Label htmlFor="dadosUnidade">Dados da Unidade</Label>
            <Input
              id="dadosUnidade"
              placeholder="Ex: Endereço, telefone (cabeçalho direita)"
              value={config.dadosUnidade}
              onChange={(e) => setConfig((p) => ({ ...p, dadosUnidade: e.target.value }))}
            />
          </div>

          {/* Rodapé */}
          <div className="space-y-2">
            <Label htmlFor="rodape">Rodapé</Label>
            <Input
              id="rodape"
              placeholder="Ex: SensoriAI - Gerado em {data}"
              value={config.rodape}
              onChange={(e) => setConfig((p) => ({ ...p, rodape: e.target.value }))}
            />
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={config.layout}
              onValueChange={(v) => setConfig((p) => ({ ...p, layout: v as 'grid' | 'lista' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid (blocos lado a lado)</SelectItem>
                <SelectItem value="lista">Lista (blocos empilhados)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
