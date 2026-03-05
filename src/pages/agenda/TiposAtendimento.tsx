import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, MoreHorizontal, Video, UserPlus, Beaker, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface AppointmentType {
  id: string;
  name: string;
  duration: string;
  color: string;
  colorLabel: string;
  description: string;
  active: boolean;
  allowWalkIn: boolean;
  requiresPreparation: boolean;
  teleconsultationAllowed: boolean;
  defaultPrice?: string;
}

const TYPES: AppointmentType[] = [
  { id: "1", name: "Consulta Inicial", duration: "30 min", color: "bg-status-scheduled", colorLabel: "Azul", description: "Primeira consulta do paciente com avaliação completa", active: true, allowWalkIn: false, requiresPreparation: false, teleconsultationAllowed: true, defaultPrice: "R$ 250" },
  { id: "2", name: "Retorno", duration: "15 min", color: "bg-status-confirmed", colorLabel: "Verde", description: "Consulta de acompanhamento e revisão de tratamento", active: true, allowWalkIn: true, requiresPreparation: false, teleconsultationAllowed: true, defaultPrice: "R$ 150" },
  { id: "3", name: "Teleconsulta", duration: "30 min", color: "bg-primary", colorLabel: "Roxo", description: "Atendimento remoto por vídeo chamada", active: true, allowWalkIn: false, requiresPreparation: false, teleconsultationAllowed: true, defaultPrice: "R$ 200" },
  { id: "4", name: "Exame", duration: "45 min", color: "bg-amber-500", colorLabel: "Âmbar", description: "Realização de exames clínicos e laboratoriais", active: true, allowWalkIn: false, requiresPreparation: true, teleconsultationAllowed: false, defaultPrice: "R$ 350" },
  { id: "5", name: "Procedimento", duration: "60 min", color: "bg-status-noshow", colorLabel: "Vermelho", description: "Procedimentos médicos que requerem mais tempo", active: false, allowWalkIn: false, requiresPreparation: true, teleconsultationAllowed: false, defaultPrice: "R$ 500" },
  { id: "6", name: "Encaixe", duration: "10 min", color: "bg-muted-foreground", colorLabel: "Cinza", description: "Atendimento rápido encaixado entre consultas", active: true, allowWalkIn: true, requiresPreparation: false, teleconsultationAllowed: false },
];

const TiposAtendimento = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Tipos de Atendimento</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure os tipos de atendimento disponíveis na clínica</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-card gap-2">
              <Plus className="h-4 w-4" />
              Novo Tipo de Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Tipo de Atendimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Consulta Inicial" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duração padrão</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Cor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-scheduled" />Azul</div></SelectItem>
                      <SelectItem value="green"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-confirmed" />Verde</div></SelectItem>
                      <SelectItem value="purple"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" />Roxo</div></SelectItem>
                      <SelectItem value="red"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-noshow" />Vermelho</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preço padrão</Label>
                <Input placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva o tipo de atendimento..." rows={2} />
              </div>

              {/* Optional settings */}
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurações opcionais</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Checkbox id="walkin" />
                    <Label htmlFor="walkin" className="text-sm font-normal cursor-pointer">Permitir encaixe (walk-in)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="prep" />
                    <Label htmlFor="prep" className="text-sm font-normal cursor-pointer">Requer preparação prévia</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="tele" />
                    <Label htmlFor="tele" className="text-sm font-normal cursor-pointer">Teleconsulta permitida</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => setIsOpen(false)}>Criar Tipo</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TYPES.map(type => (
          <div
            key={type.id}
            className={`bg-card rounded-xl border border-border shadow-card p-5 transition-all hover:shadow-card-hover ${
              !type.active ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{type.name}</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" />Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{type.description}</p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {type.allowWalkIn && (
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                  <UserPlus className="h-2.5 w-2.5" /> Encaixe
                </Badge>
              )}
              {type.requiresPreparation && (
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 bg-status-noshow/5 text-status-noshow border-status-noshow/20">
                  <Beaker className="h-2.5 w-2.5" /> Preparação
                </Badge>
              )}
              {type.teleconsultationAllowed && (
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 bg-status-scheduled/5 text-status-scheduled border-status-scheduled/20">
                  <Video className="h-2.5 w-2.5" /> Teleconsulta
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm">{type.duration}</span>
                </div>
                {type.defaultPrice && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="text-sm">{type.defaultPrice}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{type.active ? "Ativo" : "Inativo"}</span>
                <Switch checked={type.active} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TiposAtendimento;
