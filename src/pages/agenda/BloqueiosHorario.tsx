import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Clock, User, AlertTriangle, Sun, Sunset, CalendarDays, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Block {
  id: string;
  doctor: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  category: string;
  createdBy: string;
  recurring?: boolean;
  recurrenceRule?: string;
}

const BLOCKS: Block[] = [
  { id: "1", doctor: "Dr. Silva", date: "10 Mar, 2026", startTime: "08:00", endTime: "18:00", reason: "Férias", category: "vacation", createdBy: "Admin" },
  { id: "2", doctor: "Dra. Santos", date: "12 Mar, 2026", startTime: "13:00", endTime: "15:00", reason: "Reunião de equipe", category: "meeting", createdBy: "Dra. Santos" },
  { id: "3", doctor: "Dr. Lima", date: "14 Mar, 2026", startTime: "10:00", endTime: "11:30", reason: "Manutenção de equipamento", category: "maintenance", createdBy: "Admin" },
  { id: "4", doctor: "Dr. Silva", date: "15 Mar, 2026", startTime: "14:00", endTime: "16:00", reason: "Compromisso pessoal", category: "personal", createdBy: "Dr. Silva" },
  { id: "5", doctor: "Dra. Santos", date: "20 Mar, 2026", startTime: "08:00", endTime: "18:00", reason: "Congresso médico", category: "meeting", createdBy: "Dra. Santos" },
  { id: "6", doctor: "Dr. Lima", date: "Toda segunda", startTime: "08:00", endTime: "12:00", reason: "Pesquisa acadêmica", category: "personal", createdBy: "Dr. Lima", recurring: true, recurrenceRule: "Toda segunda-feira" },
];

const CATEGORY_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  vacation: { label: "Férias", className: "bg-accent text-accent-foreground", icon: <Sun className="h-3 w-3" /> },
  meeting: { label: "Reunião", className: "bg-status-scheduled/10 text-status-scheduled", icon: <User className="h-3 w-3" /> },
  personal: { label: "Pessoal", className: "bg-primary/10 text-primary", icon: <CalendarDays className="h-3 w-3" /> },
  maintenance: { label: "Manutenção", className: "bg-status-noshow/10 text-status-noshow", icon: <AlertTriangle className="h-3 w-3" /> },
};

const BloqueiosHorario = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Bloqueios de Horário</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os bloqueios na agenda dos profissionais</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-card gap-2">
              <Plus className="h-4 w-4" />
              Novo Bloqueio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Bloqueio de Horário</DialogTitle>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Férias</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Hora início</Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label>Hora fim</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Bloqueio recorrente</p>
                    <p className="text-xs text-muted-foreground">Repetir semanalmente</p>
                  </div>
                </div>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Repetir</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Toda semana</SelectItem>
                        <SelectItem value="biweekly">A cada 2 semanas</SelectItem>
                        <SelectItem value="monthly">Todo mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Até</Label>
                    <Input type="date" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea placeholder="Descreva o motivo do bloqueio..." rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => setIsOpen(false)}>Criar Bloqueio</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-6">
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] h-9 bg-card shadow-card">
            <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
            <SelectItem value="dr-silva">Dr. Silva</SelectItem>
            <SelectItem value="dra-santos">Dra. Santos</SelectItem>
            <SelectItem value="dr-lima">Dr. Lima</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-[180px] h-9 bg-card shadow-card" />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-card">
            <Sun className="h-3.5 w-3.5" />
            Bloquear Manhã
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-card">
            <Sunset className="h-3.5 w-3.5" />
            Bloquear Tarde
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs shadow-card">
            <CalendarDays className="h-3.5 w-3.5" />
            Bloquear Dia Inteiro
          </Button>
        </div>
      </div>

      {/* Blocks List */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px_1fr_100px_80px] gap-4 px-5 py-3 border-b border-border bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profissional</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Horário</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motivo</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Criado por</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Ações</span>
        </div>
        {BLOCKS.map((block, idx) => (
          <div
            key={block.id}
            className={`grid grid-cols-[1fr_120px_140px_1fr_100px_80px] gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors ${
              idx < BLOCKS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{block.doctor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {block.recurring ? (
                <Repeat className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">{block.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-foreground">{block.startTime} → {block.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`gap-1 ${CATEGORY_CONFIG[block.category]?.className}`}>
                {CATEGORY_CONFIG[block.category]?.icon}
                {CATEGORY_CONFIG[block.category]?.label}
              </Badge>
              <span className="text-sm text-muted-foreground truncate">{block.reason}</span>
            </div>
            <span className="text-sm text-muted-foreground">{block.createdBy}</span>
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BloqueiosHorario;
