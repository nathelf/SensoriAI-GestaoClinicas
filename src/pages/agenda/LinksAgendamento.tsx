import { useState } from "react";
import { Plus, Copy, Pencil, Power, ExternalLink, Link2, User, Clock, Check, Eye, CalendarDays, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BookingLink {
  id: string;
  doctor: string;
  type: string;
  duration: string;
  availability: string;
  url: string;
  active: boolean;
  minNotice: string;
  maxPerDay: number;
  allowedDays: string;
  hasQuestionnaire: boolean;
}

const LINKS: BookingLink[] = [
  { id: "1", doctor: "Dr. Silva", type: "Consulta Inicial", duration: "30 min", availability: "Seg–Sex, 08:00–18:00", url: "https://clinica.app/agendar/dr-silva-consulta", active: true, minNotice: "24h", maxPerDay: 8, allowedDays: "Seg–Sex", hasQuestionnaire: true },
  { id: "2", doctor: "Dr. Silva", type: "Teleconsulta", duration: "30 min", availability: "Seg–Qua, 14:00–17:00", url: "https://clinica.app/agendar/dr-silva-tele", active: true, minNotice: "12h", maxPerDay: 5, allowedDays: "Seg–Qua", hasQuestionnaire: false },
  { id: "3", doctor: "Dra. Santos", type: "Retorno", duration: "15 min", availability: "Ter–Qui, 09:00–12:00", url: "https://clinica.app/agendar/dra-santos-retorno", active: true, minNotice: "4h", maxPerDay: 12, allowedDays: "Ter–Qui", hasQuestionnaire: false },
  { id: "4", doctor: "Dr. Lima", type: "Exame", duration: "45 min", availability: "Sex, 08:00–12:00", url: "https://clinica.app/agendar/dr-lima-exame", active: false, minNotice: "48h", maxPerDay: 4, allowedDays: "Sex", hasQuestionnaire: true },
];

const LinksAgendamento = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<BookingLink | null>(null);
  const [enableQuestionnaire, setEnableQuestionnaire] = useState(false);
  const { toast } = useToast();

  const copyLink = (link: BookingLink) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Links de Agendamento</h1>
          <p className="text-sm text-muted-foreground mt-1">Crie links públicos para que pacientes agendem online</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-card gap-2">
              <Plus className="h-4 w-4" />
              Criar Link de Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Link de Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Profissional</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-silva">Dr. Silva</SelectItem>
                    <SelectItem value="dra-santos">Dra. Santos</SelectItem>
                    <SelectItem value="dr-lima">Dr. Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Atendimento</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta Inicial</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="tele">Teleconsulta</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Slug personalizado</Label>
                <div className="flex items-center gap-0 bg-muted rounded-lg overflow-hidden border border-border">
                  <span className="text-xs text-muted-foreground px-3 flex-shrink-0">clinica.app/agendar/</span>
                  <Input placeholder="dr-silva-consulta" className="border-0 bg-transparent rounded-none h-9" />
                </div>
              </div>

              {/* Booking rules */}
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regras de agendamento</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Antecedência mínima</Label>
                    <Select defaultValue="24h">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2h">2 horas</SelectItem>
                        <SelectItem value="4h">4 horas</SelectItem>
                        <SelectItem value="12h">12 horas</SelectItem>
                        <SelectItem value="24h">24 horas</SelectItem>
                        <SelectItem value="48h">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Máx. agendamentos/dia</Label>
                    <Input type="number" defaultValue="8" className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Dias permitidos</Label>
                  <Select defaultValue="seg-sex">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seg-sex">Segunda a Sexta</SelectItem>
                      <SelectItem value="seg-sab">Segunda a Sábado</SelectItem>
                      <SelectItem value="todos">Todos os dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Questionnaire toggle */}
              <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Questionário pré-agendamento</p>
                    <p className="text-xs text-muted-foreground">Coletar informações antes da consulta</p>
                  </div>
                </div>
                <Switch checked={enableQuestionnaire} onCheckedChange={setEnableQuestionnaire} />
              </div>

              {enableQuestionnaire && (
                <div className="space-y-2">
                  <Label className="text-xs">Perguntas</Label>
                  <Textarea placeholder="Ex: Qual o motivo da consulta?&#10;Está tomando alguma medicação?" rows={3} className="text-xs" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => setIsOpen(false)}>Criar Link</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {LINKS.map(link => (
          <div
            key={link.id}
            className={`bg-card rounded-xl border border-border shadow-card p-5 transition-all hover:shadow-card-hover ${
              !link.active ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{link.type}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{link.doctor}</span>
                  </div>
                </div>
              </div>
              <Badge variant={link.active ? "default" : "secondary"} className={link.active ? "bg-status-confirmed/10 text-status-confirmed border-status-confirmed/30" : ""}>
                {link.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{link.duration}</span>
                <span className="text-border">•</span>
                <span>{link.availability}</span>
              </div>

              {/* Rules badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5">
                  <CalendarDays className="h-2.5 w-2.5" /> Min. {link.minNotice}
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5">
                  <Hash className="h-2.5 w-2.5" /> Máx. {link.maxPerDay}/dia
                </Badge>
                {link.hasQuestionnaire && (
                  <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                    <FileText className="h-2.5 w-2.5" /> Questionário
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{link.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1"
                onClick={() => copyLink(link)}
              >
                {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === link.id ? "Copiado!" : "Copiar Link"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewLink(link)}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Power className="h-3.5 w-3.5" />
                {link.active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewLink} onOpenChange={() => setPreviewLink(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Preview da Página de Agendamento</DialogTitle>
          </DialogHeader>
          {previewLink && (
            <div className="border border-border rounded-xl p-5 bg-background">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{previewLink.doctor}</h3>
                  <p className="text-sm text-muted-foreground">{previewLink.type}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{previewLink.duration}</span>
                </div>
                <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Disponibilidade</p>
                  <p>{previewLink.availability}</p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground" disabled>
                  Agendar Consulta
                </Button>
                <p className="text-[10px] text-muted-foreground">Prévia — os pacientes verão esta página</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinksAgendamento;
