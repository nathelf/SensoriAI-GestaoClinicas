import { useState } from "react";
import { Plus, Trash2, Clock, MapPin, User, Copy, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const WEEKDAYS = [
  { key: "seg", label: "Segunda-feira", short: "Seg" },
  { key: "ter", label: "Terça-feira", short: "Ter" },
  { key: "qua", label: "Quarta-feira", short: "Qua" },
  { key: "qui", label: "Quinta-feira", short: "Qui" },
  { key: "sex", label: "Sexta-feira", short: "Sex" },
  { key: "sab", label: "Sábado", short: "Sáb" },
];

interface TimeRange {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  ranges: TimeRange[];
}

const DEFAULT_AVAILABILITY: Record<string, DayAvailability> = {
  seg: { enabled: true, ranges: [{ id: "1", start: "08:00", end: "12:00" }, { id: "2", start: "13:30", end: "18:00" }] },
  ter: { enabled: true, ranges: [{ id: "3", start: "08:00", end: "12:00" }, { id: "4", start: "14:00", end: "17:00" }] },
  qua: { enabled: true, ranges: [{ id: "5", start: "09:00", end: "12:00" }] },
  qui: { enabled: true, ranges: [{ id: "6", start: "08:00", end: "12:00" }, { id: "7", start: "13:00", end: "18:00" }] },
  sex: { enabled: true, ranges: [{ id: "8", start: "08:00", end: "12:00" }] },
  sab: { enabled: false, ranges: [] },
};

const BLOCKED_EXCEPTIONS = [
  { date: "10 Mar, 2026", reason: "Férias", type: "vacation" as const },
  { date: "14 Mar, 2026", reason: "Manutenção equipamento", type: "maintenance" as const },
];

const Disponibilidade = () => {
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [bufferTime, setBufferTime] = useState("5");
  const [maxPerShift, setMaxPerShift] = useState("12");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const addRange = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, { id: Date.now().toString(), start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeRange = (day: string, rangeId: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter(r => r.id !== rangeId),
      },
    }));
  };

  const updateRange = (day: string, rangeId: string, field: "start" | "end", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.map(r => r.id === rangeId ? { ...r, [field]: value } : r),
      },
    }));
  };

  const copyFromDoctor = () => {
    toast({ title: "Disponibilidade copiada!", description: "Horários de Dra. Santos foram aplicados." });
    setCopyDialogOpen(false);
  };

  // Compute total weekly hours
  const totalHours = Object.values(availability).reduce((acc, day) => {
    if (!day.enabled) return acc;
    return acc + day.ranges.reduce((sum, r) => {
      const [sh, sm] = r.start.split(":").map(Number);
      const [eh, em] = r.end.split(":").map(Number);
      return sum + (eh * 60 + em - sh * 60 - sm) / 60;
    }, 0);
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Disponibilidade dos Profissionais</h1>
          <p className="text-sm text-muted-foreground mt-1">Defina os horários de atendimento de cada profissional</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 shadow-card">
                <Copy className="h-4 w-4" />
                Copiar de outro profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Copiar Disponibilidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Copiar disponibilidade de:</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dra-santos">Dra. Santos</SelectItem>
                      <SelectItem value="dr-lima">Dr. Lima</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Isso substituirá toda a disponibilidade atual.</p>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" onClick={copyFromDoctor}>Copiar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setCopyDialogOpen(false)}>Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-card gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Disponibilidade
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Select defaultValue="dr-silva">
          <SelectTrigger className="w-[240px] h-9 bg-card shadow-card">
            <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dr-silva">Dr. Silva</SelectItem>
            <SelectItem value="dra-santos">Dra. Santos</SelectItem>
            <SelectItem value="dr-lima">Dr. Lima</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] h-9 bg-card shadow-card">
            <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as unidades</SelectItem>
            <SelectItem value="centro">Unidade Centro</SelectItem>
            <SelectItem value="sul">Unidade Sul</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-medium">
          {totalHours.toFixed(1)}h / semana
        </div>
      </div>

      {/* Settings Row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-card px-4 py-3 flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Buffer entre consultas</p>
            <Select value={bufferTime} onValueChange={setBufferTime}>
              <SelectTrigger className="h-7 w-24 border-0 p-0 text-sm font-medium shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem buffer</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="10">10 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card px-4 py-3 flex items-center gap-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Máx. atendimentos por turno</p>
            <Input
              type="number"
              value={maxPerShift}
              onChange={e => setMaxPerShift(e.target.value)}
              className="h-7 w-16 border-0 p-0 text-sm font-medium shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Weekly Availability Editor */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {WEEKDAYS.map((day, idx) => {
          const dayData = availability[day.key];
          return (
            <div key={day.key} className={`flex items-start gap-4 p-5 ${idx < WEEKDAYS.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex items-center gap-3 w-44 pt-1.5 flex-shrink-0">
                <Switch checked={dayData.enabled} onCheckedChange={() => toggleDay(day.key)} />
                <span className={`text-sm font-medium ${dayData.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {day.label}
                </span>
              </div>
              <div className="flex-1">
                {dayData.enabled ? (
                  <div className="space-y-2.5">
                    {dayData.ranges.map(range => (
                      <div key={range.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="time"
                            value={range.start}
                            onChange={e => updateRange(day.key, range.id, "start", e.target.value)}
                            className="w-24 h-7 border-0 bg-transparent text-sm font-medium p-0"
                          />
                          <span className="text-muted-foreground text-sm">→</span>
                          <Input
                            type="time"
                            value={range.end}
                            onChange={e => updateRange(day.key, range.id, "end", e.target.value)}
                            className="w-24 h-7 border-0 bg-transparent text-sm font-medium p-0"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRange(day.key, range.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-hover hover:bg-primary-light gap-1.5 h-8 text-xs"
                      onClick={() => addRange(day.key)}
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar horário
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pt-1.5">Indisponível</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blocked Days Preview */}
      {BLOCKED_EXCEPTIONS.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-noshow" />
            Exceções e bloqueios próximos
          </h3>
          <div className="flex flex-wrap gap-3">
            {BLOCKED_EXCEPTIONS.map((ex, i) => (
              <div key={i} className="bg-destructive/5 border border-destructive/15 rounded-lg px-4 py-2.5 flex items-center gap-3">
                <div className="text-sm font-medium text-foreground">{ex.date}</div>
                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{ex.reason}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6 gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">Salvar Alterações</Button>
      </div>
    </div>
  );
};

export default Disponibilidade;
