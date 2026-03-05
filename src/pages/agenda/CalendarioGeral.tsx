import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  User,
  Calendar,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CalendarViewSelector from "@/components/agenda/CalendarViewSelector";
import StatusFilterChips from "@/components/agenda/StatusFilterChips";
import CurrentTimeIndicator from "@/components/agenda/CurrentTimeIndicator";
import AppointmentCard, {
  STATUS_CONFIG,
  HOURS,
  type Appointment as UIAppointment,
  type AppointmentStatus as UIAppointmentStatus,
} from "@/components/agenda/AppointmentCard";
import { agendaService } from "@/services/agendaService";
import { Appointment as SupabaseAppointment, CreateAppointmentPayload } from "@/types/agenda";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Patient { id: string; name: string; }
interface Professional { id: string; name: string; }
interface Procedure { id: string; name: string; price: number; duration_minutes: number; }
interface Room { id: string; name: string; }

type FormStatus = "agendado" | "confirmado" | "faltou" | "cancelado" | "concluido";

const emptyForm: {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: FormStatus;
  notes: string;
  price: string;
} = {
  patient_id: "",
  professional_id: "",
  procedure_id: "",
  room_id: "",
  start_time: "",
  end_time: "",
  status: "agendado",
  notes: "",
  price: "0",
};

// Availability: slots where professional is available (true = available)
const AVAILABILITY: Record<number, { start: number; end: number }[]> = {
  0: [{ start: 2, end: 10 }, { start: 13, end: 22 }], // 08:00-12:00, 13:30-18:00
  1: [{ start: 2, end: 10 }, { start: 14, end: 20 }],
  2: [{ start: 4, end: 10 }],
  3: [{ start: 2, end: 10 }, { start: 12, end: 22 }],
  4: [{ start: 2, end: 10 }],
  5: [],
};

// Blocked slots
const BLOCKED_SLOTS: { day: number; start: number; end: number; reason: string }[] = [
  { day: 2, start: 14, end: 18, reason: "Reunião" },
];

const isAvailable = (day: number, slot: number): boolean => {
  const ranges = AVAILABILITY[day] || [];
  return ranges.some((r) => slot >= r.start && slot < r.end);
};

const isBlocked = (day: number, slot: number): { blocked: boolean; reason?: string } => {
  const block = BLOCKED_SLOTS.find((b) => b.day === day && slot >= b.start && slot < b.end);
  return block ? { blocked: true, reason: block.reason } : { blocked: false };
};

const SLOT_HEIGHT = 56;

// Helper to convert real appointments to UI-friendly ones
const mapSupabaseToUI = (apt: SupabaseAppointment): UIAppointment => {
  const dateObj = new Date(apt.start_time);
  const startSlotIndex = Math.floor(
    (dateObj.getHours() * 60 + dateObj.getMinutes() - 420) / 30
  ); // 420 = 7:00 AM in minutes

  const procedureMins = apt.procedures?.duration_minutes || 30;
  const slotCount = Math.ceil(procedureMins / 30) || 1;

  const jsDay = getDay(dateObj); // 0=Sun, 1=Mon...
  let mappedDay = jsDay - 1; // 1(Mon)->0, 6(Sat)->5
  if (mappedDay < 0) mappedDay = 0;

  return {
    id: apt.id,
    patient: apt.patients?.name || "Paciente sem nome",
    type: apt.procedures?.name || "Consulta Padrão",
    duration: `${procedureMins} min`,
    status: (apt.status as UIAppointmentStatus) ?? "agendado",
    day: mappedDay,
    startSlot: startSlotIndex > 0 ? startSlotIndex : 0,
    slots: slotCount,
    modality: "presencial",
  };
};

const CalendarioGeral = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<UIAppointment | null>(null);
  const [calendarView, setCalendarView] = useState<"default" | "compact" | "timeline">("default");
  const [statusFilter, setStatusFilter] = useState<UIAppointmentStatus[]>([]);
  const [viewMode, setViewMode] = useState<"day" | "doctor">("day");
  const [currentWeekTop, setCurrentWeekTop] = useState<Date>(new Date());

  // State from Backend
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Entities & Form
  const { data: patients } = useCrud<Patient>({ table: "patients" });
  const { data: professionals } = useCrud<Professional>({ table: "professionals" });
  const { data: procedures } = useCrud<Procedure>({ table: "procedures" });
  const { data: rooms } = useCrud<Room>({ table: "rooms" });
  const { update: updateAppt } = useCrud<SupabaseAppointment>({ table: "appointments" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentSlot = (now.getHours() - 7) * 2 + (now.getMinutes() >= 30 ? 1 : 0);
      const scrollTarget = Math.max(0, (currentSlot - 2) * SLOT_HEIGHT);
      scrollRef.current.scrollTop = scrollTarget;
    }
  }, []);

  // ✅ Cancelamento via X (QuickAction)
  const handleStatusChange = async (id: string, status: UIAppointmentStatus) => {
    try {
      // Ignora mock e garante que só cancela por enquanto
      if (id === "mock-example-1") {
        toast.info("Agendamento de exemplo não pode ser alterado.");
        return;
      }
      if (status !== "cancelado") return;

      await agendaService.cancelAppointment(id);

      // ✅ Atualiza UI local sem esperar refetch
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelado" } : a))
      );

      toast.success("Agendamento cancelado.");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Não foi possível cancelar o agendamento.");
    }
  };

  // Fetch appointments
  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const startOfWeekDate = startOfWeek(currentWeekTop, { weekStartsOn: 1 });
      const endOfWeekDate = addDays(startOfWeekDate, 6);

      const startStr = startOfWeekDate.toISOString();
      const endStr = endOfWeekDate.toISOString();

      const rawAppointments = await agendaService.getAppointments(startStr, endStr);
      const uiAppointments = rawAppointments.map(mapSupabaseToUI);

      // ✅ Se quiser mock visual, mantenha, mas com status PT
      if (uiAppointments.length === 0) {
        const todayMap = getDay(new Date()) - 1;
        const mockDay = todayMap >= 0 && todayMap <= 5 ? todayMap : 0;

        uiAppointments.push({
          id: "mock-example-1",
          patient: "Paciente Exemplo (Mock)",
          type: "Consulta Inicial",
          duration: "60 min",
          status: "confirmado", // ✅ PT
          day: mockDay,
          startSlot: 6, // 10:00
          slots: 2,
          modality: "presencial",
        });
      }

      setAppointments(uiAppointments);
    } catch (error) {
      console.error("Failed to load agenda", error);
      toast.error("Falha ao carregar agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekTop]);

  // Modals Actions
  const openCreate = (dateObj: Date, hourStr: string) => {
    setEditingId(null);
    const dateStr = format(dateObj, "yyyy-MM-dd");

    // end_time simples: +30min (MVP)
    const [hh, mm] = hourStr.split(":").map(Number);
    const endDate = new Date(dateObj);
    endDate.setHours(hh, mm, 0, 0);
    endDate.setMinutes(endDate.getMinutes() + 30);
    const endStr = format(endDate, "HH:mm");

    setForm({
      ...emptyForm,
      start_time: `${dateStr}T${hourStr}`,
      end_time: `${dateStr}T${endStr}`,
      status: "agendado",
    });

    setModalOpen(true);
  };

  const openEdit = async (uiApt: UIAppointment) => {
    setEditingId(uiApt.id);

    try {
      if (uiApt.id === "mock-example-1") {
        const weekStartCurrent = startOfWeek(currentWeekTop, { weekStartsOn: 1 });
        const mockDate = format(addDays(weekStartCurrent, uiApt.day), "yyyy-MM-dd");
        setForm({
          ...emptyForm,
          start_time: `${mockDate}T10:00`,
          end_time: `${mockDate}T11:00`,
          status: "confirmado",
          notes: "Este é um agendamento de exemplo para teste da UI.",
        });
        setModalOpen(true);
        return;
      }

      const startOfWeekDate = startOfWeek(currentWeekTop, { weekStartsOn: 1 });
      const endOfWeekDate = addDays(startOfWeekDate, 6);

      const rawAppointments = await agendaService.getAppointments(
        startOfWeekDate.toISOString(),
        endOfWeekDate.toISOString()
      );
      const raw = rawAppointments.find((a) => a.id === uiApt.id);

      if (raw) {
        setForm({
          patient_id: raw.patient_id || "",
          // ✅ FIX: no schema real é professional_id, mas teu type agenda.ts ainda tem profissional_id
          professional_id: (raw as any).professional_id || (raw as any).profissional_id || "",
          procedure_id: raw.procedure_id || "",
          room_id: raw.room_id || "",
          start_time: raw.start_time.slice(0, 16),
          end_time: raw.end_time.slice(0, 16),
          status: raw.status as FormStatus,
          notes: raw.notes || "",
          price: String(raw.procedures?.price || 0),
        });
        setModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!form.professional_id) throw new Error("Profissional é obrigatório");

      const startIso = new Date(form.start_time).toISOString();
      const endIso = new Date(form.end_time).toISOString();

      if (editingId) {
        if (editingId === "mock-example-1") {
          toast.info(
            "O agendamento de exemplo é apenas para visualização de interface e não pode ser salvo no banco."
          );
          setModalOpen(false);
          setSaving(false);
          return;
        }

        await agendaService.rescheduleAppointment({
          p_appointment_id: editingId,
          p_new_start_time: startIso,
          p_new_end_time: endIso,
        });

        await updateAppt(
          editingId,
          {
            patient_id: form.patient_id || null,
            professional_id: form.professional_id,
            procedure_id: form.procedure_id || null,
            room_id: form.room_id || null,
            status: form.status,
            notes: form.notes || null,
          } as any
        );

        toast.success("Agendamento atualizado");
      } else {
        await agendaService.createAppointment({
          p_patient_id: form.patient_id || undefined,
          p_profissional_id: form.professional_id,
          p_procedure_id: form.procedure_id || undefined,
          p_room_id: form.room_id || undefined,
          p_start_time: startIso,
          p_end_time: endIso,
          p_notes: form.notes || undefined,
        } as CreateAppointmentPayload);

        toast.success("Agendamento criado com sucesso!");
      }

      setModalOpen(false);
      fetchAgenda();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const filteredAppointments =
    statusFilter.length === 0
      ? appointments
      : appointments.filter((a) => statusFilter.includes(a.status));

  const todayMap = getDay(new Date()) - 1;
  const todayIndex = todayMap >= 0 ? todayMap : 0;

  const weekStart = startOfWeek(currentWeekTop, { weekStartsOn: 1 });

  const DATES = Array.from({ length: 6 }).map((_, i) => {
    const date = addDays(weekStart, i);
    return format(date, "dd MMM", { locale: ptBR });
  });

  const goPrevWeek = () => setCurrentWeekTop((prev) => addDays(prev, -7));
  const goNextWeek = () => setCurrentWeekTop((prev) => addDays(prev, 7));
  const goToday = () => setCurrentWeekTop(new Date());

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Calendário Geral
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie todos os agendamentos da clínica
            </p>
          </div>
          <Button
            onClick={() => openCreate(new Date(), "08:00")}
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-card gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-card rounded-lg border border-border shadow-card p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={goPrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium rounded-md" onClick={goToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={goNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm font-medium text-foreground capitalize">
            {format(weekStart, "dd")} –{" "}
            {format(addDays(weekStart, 5), "dd MMM, yyyy", { locale: ptBR })}
          </span>

          <div className="flex-1" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("day")}
              className={`h-7 px-2.5 gap-1.5 text-xs rounded-md transition-all ${
                viewMode === "day"
                  ? "bg-card shadow-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Por Dia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("doctor")}
              className={`h-7 px-2.5 gap-1.5 text-xs rounded-md transition-all ${
                viewMode === "doctor"
                  ? "bg-card shadow-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Por Médico
            </Button>
          </div>

          <CalendarViewSelector value={calendarView} onChange={setCalendarView} />

          <Select defaultValue="all">
            <SelectTrigger className="w-[200px] h-9 bg-card shadow-card">
              <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              <SelectItem value="dr-silva">Dr. Silva</SelectItem>
              <SelectItem value="dra-santos">Dra. Santos</SelectItem>
              <SelectItem value="dr-lima">Dr. Lima</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." className="pl-9 h-9 w-[220px] bg-card shadow-card" />
          </div>
        </div>

        {/* Status Filter Chips + Type Filter */}
        <div className="flex items-center gap-3">
          <StatusFilterChips selected={statusFilter} onChange={setStatusFilter} />
          <div className="flex-1" />
          <Select defaultValue="all-types">
            <SelectTrigger className="w-[180px] h-8 bg-card shadow-card text-xs">
              <SelectValue placeholder="Tipo de atendimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">Todos os tipos</SelectItem>
              <SelectItem value="consulta">Consulta Inicial</SelectItem>
              <SelectItem value="retorno">Retorno</SelectItem>
              <SelectItem value="teleconsulta">Teleconsulta</SelectItem>
              <SelectItem value="exame">Exame</SelectItem>
              <SelectItem value="procedimento">Procedimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border">
          <div className="p-3 border-r border-border" />
          {DAYS.map((day, i) => {
            const dateStr = DATES[i];
            const isActualToday = isSameDay(new Date(), addDays(weekStart, i));
            return (
              <div
                key={day}
                className={`p-3 text-center border-r border-border last:border-r-0 ${
                  isActualToday ? "bg-primary/5" : ""
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
                <div className={`text-lg font-semibold mt-0.5 ${isActualToday ? "text-primary" : "text-foreground"}`}>
                  {dateStr.split(" ")[0]}
                </div>
                {isActualToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-340px)] relative" ref={scrollRef}>
          {calendarView === "default" && (
            <DefaultCalendarView
              appointments={filteredAppointments}
              onSelect={setSelectedAppointment}
              todayIndex={todayIndex}
              dates={DATES}
              weekStart={weekStart}
              openCreate={openCreate}
              onStatusChange={handleStatusChange}
            />
          )}
          {calendarView === "compact" && (
            <CompactCalendarView
              appointments={filteredAppointments}
              onSelect={setSelectedAppointment}
              todayIndex={todayIndex}
              dates={DATES}
              weekStart={weekStart}
              openCreate={openCreate}
            />
          )}
          {calendarView === "timeline" && (
            <TimelineCalendarView appointments={filteredAppointments} onSelect={setSelectedAppointment} dates={DATES} />
          )}
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-5 pt-3">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-muted border border-border" />
            <span>Indisponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-3 rounded-sm bg-destructive/10 border border-destructive/20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent, transparent 2px, hsl(var(--destructive) / 0.1) 2px, hsl(var(--destructive) / 0.1) 4px)",
              }}
            />
            <span>Bloqueado</span>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedAppointment.patient}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="text-sm font-medium text-foreground">{selectedAppointment.duration}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedAppointment.status].className}>
                    {STATUS_CONFIG[selectedAppointment.status].label}
                  </Badge>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Horário</p>
                  <p className="text-sm font-medium text-foreground">{HOURS[selectedAppointment.startSlot]}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Dia</p>
                  <p className="text-sm font-medium text-foreground">{DATES[selectedAppointment.day]}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedAppointment(null);
                    openEdit(selectedAppointment);
                  }}
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setDeleteId(selectedAppointment.id);
                  }}
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crud Modal (Creation / Editing) */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Agendamento" : "Novo Agendamento"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Paciente">
          <FormSelect value={form.patient_id} onChange={(e) => setF("patient_id", e.target.value)}>
            <option value="" disabled className="text-muted-foreground/50">
              Selecione o paciente (opcional)
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Profissional *" hint="Obrigatório">
            <FormSelect value={form.professional_id} onChange={(e) => setF("professional_id", e.target.value)} required>
              <option value="" disabled className="text-muted-foreground/50">
                Selecione o profissional
              </option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="Procedimento">
            <FormSelect value={form.procedure_id} onChange={(e) => setF("procedure_id", e.target.value)}>
              <option value="" disabled className="text-muted-foreground/50">
                Selecione o procedimento
              </option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início *">
            <FormInput
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setF("start_time", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Fim *">
            <FormInput
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setF("end_time", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(e) => setF("status", e.target.value)}>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              {editingId && (
                <>
                  <option value="faltou">Faltou</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="concluido">Concluído</option>
                </>
              )}
            </FormSelect>
          </FormField>

          <FormField label="Sala / Consultório">
            <FormSelect value={form.room_id} onChange={(e) => setF("room_id", e.target.value)}>
              <option value="" disabled className="text-muted-foreground/50">
                Opcional
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>

        <FormField label="Observações">
          <FormTextarea
            value={form.notes}
            onChange={(e) => setF("notes", e.target.value)}
            placeholder="Anotações sobre este agendamento..."
          />
        </FormField>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await agendaService.cancelAppointment(deleteId);
          toast.success("Agendamento cancelado", { description: "O status foi alterado para Cancelado" });
          // atualiza UI local também
          setAppointments((prev) => prev.map((a) => (a.id === deleteId ? { ...a, status: "cancelado" } : a)));
          setDeleteId(null);
        }}
        title="Cancelar Agendamento"
        message="Atenção: Você tem certeza que deseja cancelar este agendamento? Ele continuará visível com status Cancelado."
      />
    </div>
  );
};

/* ============ Default Grid View ============ */
const DefaultCalendarView = ({
  appointments,
  onSelect,
  todayIndex,
  dates,
  weekStart,
  openCreate,
  onStatusChange,
}: {
  appointments: UIAppointment[];
  onSelect: (a: UIAppointment) => void;
  todayIndex: number;
  dates: string[];
  weekStart: Date;
  openCreate: (d: Date, t: string) => void;
  onStatusChange: (id: string, status: UIAppointmentStatus) => void;
}) => (
  <div className="grid grid-cols-[60px_repeat(6,1fr)] relative">
    <CurrentTimeIndicator startHour={7} slotHeight={SLOT_HEIGHT} todayColumnIndex={todayIndex} totalColumns={6} />
    {HOURS.slice(0, 24).map((hour, rowIdx) => (
      <div key={hour} className="contents">
        <div className="px-2 py-3 text-xs text-muted-foreground text-right border-r border-border h-14 flex items-start justify-end">
          {rowIdx % 2 === 0 ? hour : ""}
        </div>
        {DAYS.map((_, colIdx) => {
          const apt = appointments.find((a) => a.day === colIdx && a.startSlot === rowIdx);
          const available = isAvailable(colIdx, rowIdx);
          const blockInfo = isBlocked(colIdx, rowIdx);
          const isToday = colIdx === todayIndex;
          const canAdd = !apt && available && !blockInfo.blocked;

          let bgClass = "";
          if (blockInfo.blocked) {
            bgClass = "bg-destructive/5";
          } else if (!available) {
            bgClass = "bg-muted/60";
          } else if (isToday) {
            bgClass = "bg-primary/[0.02]";
          }

          return (
            <div
              key={colIdx}
              className={`border-r border-b border-border last:border-r-0 h-14 p-0.5 relative group/cell transition-colors ${bgClass} ${canAdd ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (canAdd) openCreate(addDays(weekStart, colIdx), hour);
              }}
              style={
                blockInfo.blocked
                  ? {
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent, transparent 3px, hsl(var(--destructive) / 0.06) 3px, hsl(var(--destructive) / 0.06) 5px)",
                    }
                  : undefined
              }
            >
              {canAdd && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-5 pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-colors shadow-sm">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              )}

              {apt && (
                <AppointmentCard
                  appointment={apt}
                  slotHeight={SLOT_HEIGHT}
                  onClick={() => onSelect(apt)}
                  onStatusChange={onStatusChange}
                />
              )}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

/* ============ Compact View ============ */
const COMPACT_HEIGHT = 40;
const CompactCalendarView = ({
  appointments,
  onSelect,
  todayIndex,
  dates,
  weekStart,
  openCreate,
}: {
  appointments: UIAppointment[];
  onSelect: (a: UIAppointment) => void;
  todayIndex: number;
  dates: string[];
  weekStart: Date;
  openCreate: (d: Date, t: string) => void;
}) => (
  <div className="grid grid-cols-[60px_repeat(6,1fr)] relative">
    <CurrentTimeIndicator startHour={7} slotHeight={COMPACT_HEIGHT} todayColumnIndex={todayIndex} totalColumns={6} />
    {HOURS.slice(0, 24).map((hour, rowIdx) => (
      <div key={hour} className="contents">
        <div className="px-2 py-2 text-xs text-muted-foreground text-right border-r border-border h-10 flex items-center justify-end">
          {rowIdx % 2 === 0 ? hour : ""}
        </div>
        {DAYS.map((_, colIdx) => {
          const apt = appointments.find((a) => a.day === colIdx && a.startSlot === rowIdx);
          const available = isAvailable(colIdx, rowIdx);
          const blockInfo = isBlocked(colIdx, rowIdx);
          const canAdd = !apt && available && !blockInfo.blocked;

          let bgClass = "";
          if (blockInfo.blocked) bgClass = "bg-destructive/5";
          else if (!available) bgClass = "bg-muted/60";

          return (
            <div
              key={colIdx}
              className={`border-r border-b border-border last:border-r-0 h-10 px-0.5 relative group/cell transition-colors ${bgClass} ${
                canAdd ? "cursor-pointer hover:bg-primary-light/30" : ""
              }`}
              onClick={() => {
                if (canAdd) openCreate(addDays(weekStart, colIdx), hour);
              }}
              style={
                blockInfo.blocked
                  ? {
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent, transparent 3px, hsl(var(--destructive) / 0.06) 3px, hsl(var(--destructive) / 0.06) 5px)",
                    }
                  : undefined
              }
            >
              {canAdd && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none z-5">
                  <Plus className="h-3 w-3 text-primary/50" />
                </div>
              )}
              {apt && (
                <button
                  onClick={() => onSelect(apt)}
                  className={`absolute inset-x-0.5 rounded-md border px-1.5 py-0.5 text-left cursor-pointer transition-all hover:shadow-card-hover z-10 flex items-center gap-1.5 ${
                    STATUS_CONFIG[apt.status].className
                  }`}
                  style={{ height: `${apt.slots * COMPACT_HEIGHT - 2}px`, top: "1px" }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[apt.status].dotClass}`} />
                  <span className="text-[11px] font-medium truncate">{apt.patient}</span>
                  <span className="text-[10px] opacity-60 ml-auto flex-shrink-0">{apt.duration}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

/* ============ Timeline View ============ */
const TimelineCalendarView = ({
  appointments,
  onSelect,
  dates,
}: {
  appointments: UIAppointment[];
  onSelect: (a: UIAppointment) => void;
  dates: string[];
}) => (
  <div className="p-4 space-y-6">
    {DAYS.map((day, dayIdx) => {
      const dayAppts = appointments.filter((a) => a.day === dayIdx);
      if (dayAppts.length === 0) return null;
      return (
        <div key={day}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</span>
            <span className="text-sm font-medium text-foreground">{dates[dayIdx]}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-primary-light ml-2">
            {dayAppts.map((apt) => (
              <button
                key={apt.id}
                onClick={() => onSelect(apt)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-xl p-3.5 hover:shadow-card-hover transition-all text-left group"
              >
                <div className="text-sm font-mono text-muted-foreground w-14 flex-shrink-0">{HOURS[apt.startSlot]}</div>
                <div className={`w-1 h-8 rounded-full ${STATUS_CONFIG[apt.status].dotClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{apt.duration}</span>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${STATUS_CONFIG[apt.status].className}`}>
                    {STATUS_CONFIG[apt.status].label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default CalendarioGeral;