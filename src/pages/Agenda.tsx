import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  CrudModal,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { agendaService } from "@/services/agendaService";
import type { Appointment, CreateAppointmentPayload } from "@/types/agenda";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
}

interface Professional {
  id: string;
  name: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  modality?: "presencial" | "teleconsulta" | "procedimento";
  color?: string;
  buffer_before?: number;
  buffer_after?: number;
  active?: boolean;
}

interface Room {
  id: string;
  name: string;
}

const emptyForm = {
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

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [selectedProf, setSelectedProf] = useState<string>("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Entities
  const { data: patients } = useCrud<Patient>({ table: "patients" });
  const { data: professionals } = useCrud<Professional>({
    table: "professionals",
  });
  const { data: proceduresRaw } = useCrud<Procedure>({ table: "procedures" });
  const { data: rooms } = useCrud<Room>({ table: "rooms" });
  const { update: updateAppt } = useCrud<Appointment>({ table: "appointments" });

  // Deixa procedures mais “limpo” (se existir active no schema)
  const procedures = (proceduresRaw ?? []).filter((p) =>
    typeof p.active === "boolean" ? p.active : true
  );

  const { markTaskDone } = useOnboarding();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      let startStr = "";
      let endStr = "";

      if (viewMode === "day") {
        const d = format(currentDate, "yyyy-MM-dd");
        startStr = `${d}T00:00:00`;
        endStr = `${d}T23:59:59`;
      } else if (viewMode === "week") {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 });
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        startStr = `${format(start, "yyyy-MM-dd")}T00:00:00`;
        endStr = `${format(end, "yyyy-MM-dd")}T23:59:59`;
      } else {
        // Month view
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
        startStr = `${format(start, "yyyy-MM-dd")}T00:00:00`;
        endStr = `${format(end, "yyyy-MM-dd")}T23:59:59`;
      }

      const data = await agendaService.getAppointments(
        startStr,
        endStr,
        selectedProf || undefined
      );
      setAppointments(data);
    } catch (err: any) {
      toast.error("Erro ao carregar agenda: " + (err?.message ?? "Erro"));
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode, selectedProf]);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  // Helpers: procedure selection + auto end_time
  const getSelectedProcedure = (procedureId: string) =>
    procedures.find((p) => p.id === procedureId);

  const recalcEndTime = (startLocal: string, procedureId: string) => {
    if (!startLocal || !procedureId) return null;

    const proc = getSelectedProcedure(procedureId);
    if (!proc) return null;

    const duration = Number(proc.duration_minutes ?? 30);
    const bufferAfter = Number(proc.buffer_after ?? 0);

    const startDate = new Date(startLocal);
    if (Number.isNaN(startDate.getTime())) return null;

    const endDate = addMinutes(startDate, duration + bufferAfter);
    return toDatetimeLocal(endDate);
  };

  const openCreate = (forcedDateStr?: string) => {
    setEditing(null);
    const useDate = forcedDateStr || dateStr;

    // padrão: 08:00–08:30
    const startLocal = `${useDate}T08:00`;
    const endLocal = `${useDate}T08:30`;

    setForm({
      ...emptyForm,
      professional_id: selectedProf,
      start_time: startLocal,
      end_time: endLocal,
    });

    setModalOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setEditing(a);

    // Alguns projetos acabam tendo "profissional_id" no type; deixei defensivo
    const professionalId =
      (a as any).professional_id || (a as any).profissional_id || "";

    setForm({
      patient_id: (a as any).patient_id || "",
      professional_id: professionalId,
      procedure_id: (a as any).procedure_id || "",
      room_id: (a as any).room_id || "",
      start_time: (a as any).start_time?.slice(0, 16) ?? "",
      end_time: (a as any).end_time?.slice(0, 16) ?? "",
      status: (a as any).status ?? "agendado",
      notes: (a as any).notes || "",
      price: String((a as any).procedures?.price || 0),
    });

    setModalOpen(true);
  };

  // Setter inteligente do form (auto calcula fim)
  const set = (k: string, v: string) => {
    setForm((prev) => {
      const next: any = { ...prev, [k]: v };

      // Se mudou procedimento: recalcula fim e preenche preço
      if (k === "procedure_id") {
        const nextEnd = recalcEndTime(next.start_time, v);
        if (nextEnd) next.end_time = nextEnd;

        const proc = procedures.find((p) => p.id === v);
        if (proc) next.price = String(proc.price ?? 0);
      }

      // Se mudou início: se já tem procedimento selecionado, recalcula fim
      if (k === "start_time" && next.procedure_id) {
        const nextEnd = recalcEndTime(v, next.procedure_id);
        if (nextEnd) next.end_time = nextEnd;
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!form.professional_id) {
        throw new Error("Profissional é obrigatório");
      }

      // Convert local time string to ISO for Supabase Timestamptz
      const startIso = new Date(form.start_time).toISOString();
      const endIso = new Date(form.end_time).toISOString();

      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        throw new Error("O horário de fim precisa ser depois do início.");
      }

      if (editing) {
        // Reschedule times via RPC
        await agendaService.rescheduleAppointment({
          p_appointment_id: editing.id,
          p_new_start_time: startIso,
          p_new_end_time: endIso,
        });

        // Update other properties via direct table update
        await updateAppt(editing.id, {
          patient_id: form.patient_id || null,
          professional_id: form.professional_id,
          procedure_id: form.procedure_id || null,
          room_id: form.room_id || null,
          status: form.status,
          notes: form.notes || null,
        } as any);

        toast.success("Agendamento atualizado");
      } else {
        // Create (RPC)
        await agendaService.createAppointment({
          p_patient_id: form.patient_id || undefined,
          p_profissional_id: form.professional_id,
          p_procedure_id: form.procedure_id || undefined,
          p_room_id: form.room_id || undefined,
          p_start_time: startIso,
          p_end_time: endIso,
          p_notes: form.notes || undefined,
        } as CreateAppointmentPayload);

        await markTaskDone("agendamento");
        toast.success("Agendamento criado com sucesso!");
      }

      setModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    agendado:
      "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    confirmado:
      "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
    cancelado:
      "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
    faltou: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
    concluido:
      "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  };

  // Views helpers
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 0 }),
    end: endOfWeek(currentDate, { weekStartsOn: 0 }),
  });

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
  });

  const monthWeekDaysHeaders = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Navigate functions
  const handlePrev = () => {
    setCurrentDate((d) => {
      if (viewMode === "day") return subDays(d, 1);
      if (viewMode === "week") return subDays(d, 7);
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    });
  };

  const handleNext = () => {
    setCurrentDate((d) => {
      if (viewMode === "day") return addDays(d, 1);
      if (viewMode === "week") return addDays(d, 7);
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <h1 className="text-2xl font-bold text-foreground">Agenda</h1>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProf}
            onChange={(e) => setSelectedProf(e.target.value)}
            className="input-field py-2 text-sm max-w-[200px]"
          >
            <option value="">Todos os Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "day"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "week"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "month"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => openCreate()}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </motion.div>

      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg capitalize">
            {viewMode === "day" &&
              format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            {viewMode === "week" &&
              `Semana de ${format(weekDays[0], "dd/MM")} até ${format(
                weekDays[6],
                "dd/MM"
              )}`}
            {viewMode === "month" &&
              format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        <button
          onClick={handleNext}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loadingAppts ? (
        <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          Carregando agenda...
        </div>
      ) : (
        <div className="glass-panel p-2 md:p-6 rounded-2xl border border-border/50 shadow-sm min-h-[500px]">
          {/* DAY VIEW */}
          {viewMode === "day" && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  Nenhum agendamento para este dia.
                </div>
              ) : (
                appointments.map((a) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={a.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md ${
                      statusColors[a.status] || statusColors.agendado
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-currentColor/20 pb-2 sm:pb-0 sm:pr-4">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold text-lg">
                        {format(new Date((a as any).start_time), "HH:mm")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold truncate">
                        {(a as any).patients?.name || "Sem Paciente"}
                      </h3>
                      <p className="text-sm opacity-80 mt-0.5 truncate flex items-center gap-2">
                        {(a as any).procedures?.name || "Sem procedimento"}
                        {(a as any).professionals?.name && (
                          <span className="text-xs px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-full">
                            {(a as any).professionals.name}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs uppercase tracking-wider font-bold opacity-80">
                        {(a as any).status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === "week" && (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weekDays.map((day, idx) => {
                const dayAppts = appointments.filter((a) =>
                  isSameDay(new Date((a as any).start_time), day)
                );
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={idx}
                    className={`flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden ${
                      isToday
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                        : ""
                    }`}
                  >
                    <div
                      className={`p-3 text-center border-b border-border/50 ${
                        isToday ? "bg-primary text-primary-foreground" : "bg-muted/50"
                      }`}
                    >
                      <div className="text-xs font-medium uppercase tracking-wider opacity-80">
                        {format(day, "EEEE", { locale: ptBR })}
                      </div>
                      <div className="text-lg font-bold mt-0.5">
                        {format(day, "dd")}
                      </div>
                    </div>

                    <div className="p-2 flex-1 min-h-[150px] space-y-2 relative">
                      {dayAppts.length === 0 ? (
                        <div className="text-xs text-center text-muted-foreground/60 py-4 absolute inset-0 flex items-center justify-center">
                          Livre
                        </div>
                      ) : (
                        dayAppts.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => openEdit(a)}
                            className={`p-2 rounded-lg text-xs cursor-pointer border hover:opacity-80 transition-opacity ${
                              statusColors[(a as any).status] || statusColors.agendado
                            }`}
                          >
                            <div className="font-bold mb-0.5 flex justify-between items-center">
                              <span>
                                {format(new Date((a as any).start_time), "HH:mm")}
                              </span>
                            </div>
                            <div className="truncate font-medium">
                              {(a as any).patients?.name || "S/ Paciente"}
                            </div>
                            <div className="truncate opacity-70 mt-1">
                              {(a as any).professionals?.name}
                            </div>
                          </div>
                        ))
                      )}

                      <button
                        onClick={() => openCreate(format(day, "yyyy-MM-dd"))}
                        className="opacity-0 hover:opacity-100 absolute bottom-2 right-2 p-1.5 bg-primary text-primary-foreground rounded-lg shadow-sm transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MONTH VIEW */}
          {viewMode === "month" && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
                {monthWeekDaysHeaders.map((dayText) => (
                  <div
                    key={dayText}
                    className="p-3 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    {dayText}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
                {monthDays.map((day, idx) => {
                  const dayAppts = appointments.filter((a) =>
                    isSameDay(new Date((a as any).start_time), day)
                  );
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={idx}
                      className={`relative p-2 border-b border-r border-border/50 transition-colors hover:bg-muted/10 flex flex-col gap-1 ${
                        !isCurrentMonth ? "bg-muted/20 opacity-60" : ""
                      } ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}`}
                    >
                      <div className="text-right w-full mb-1 flex justify-between items-center">
                        <div className="w-full text-right pointer-events-none">
                          <span
                            className={`inline-block text-sm font-medium w-7 h-7 leading-7 text-center rounded-full ${
                              isToday
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground/80"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 overflow-y-auto max-h-[120px] scrollbar-thin scrollbar-thumb-border">
                        {dayAppts.length > 0 &&
                          dayAppts.map((a) => (
                            <div
                              key={a.id}
                              onClick={() => openEdit(a)}
                              className={`px-1.5 py-1 rounded text-[10px] leading-tight cursor-pointer truncate font-medium border border-transparent hover:opacity-80 transition-opacity ${
                                statusColors[(a as any).status] || statusColors.agendado
                              }`}
                              title={`${(a as any).patients?.name || "Sem paciente"} - ${
                                (a as any).procedures?.name || ""
                              }`}
                            >
                              {format(new Date((a as any).start_time), "HH:mm")} •{" "}
                              {(a as any).patients?.name
                                ? (a as any).patients.name.split(" ")[0]
                                : "Sem paciente"}
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => openCreate(format(day, "yyyy-MM-dd"))}
                        className="opacity-0 hover:opacity-100 absolute bottom-1 right-1 p-1 bg-primary text-primary-foreground rounded shadow-sm transition-opacity"
                        title="Novo agendamento"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Agendamento" : "Novo Agendamento"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Paciente">
          <FormSelect
            value={form.patient_id}
            onChange={(e) => set("patient_id", e.target.value)}
          >
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
            <FormSelect
              value={form.professional_id}
              onChange={(e) => set("professional_id", e.target.value)}
              required
            >
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
            <FormSelect
              value={form.procedure_id}
              onChange={(e) => set("procedure_id", e.target.value)}
            >
              <option value="" disabled className="text-muted-foreground/50">
                Selecione o procedimento
              </option>
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </FormSelect>

            {/* Hint premium: mostra duração/buffer */}
            {form.procedure_id ? (() => {
              const proc = procedures.find(p => p.id === form.procedure_id);
              if (!proc) return null;
              const bufferAfter = Number(proc.buffer_after ?? 0);
              return (
                <div className="mt-1 text-xs text-muted-foreground">
                  Duração: <span className="font-medium">{proc.duration_minutes} min</span>
                  {bufferAfter > 0 ? (
                    <> • Buffer: <span className="font-medium">+{bufferAfter} min</span></>
                  ) : null}
                  {proc.modality ? (
                    <> • Modalidade: <span className="font-medium">{proc.modality}</span></>
                  ) : null}
                </div>
              );
            })() : null}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início *">
            <FormInput
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Fim *">
            <FormInput
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Status">
            <FormSelect value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              {editing && (
                <>
                  <option value="concluido">Concluído</option>
                  <option value="faltou">Faltou</option>
                  <option value="cancelado">Cancelado</option>
                </>
              )}
            </FormSelect>
          </FormField>

          <FormField label="Sala / Consultório">
            <FormSelect value={form.room_id} onChange={(e) => set("room_id", e.target.value)}>
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
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anotações sobre este agendamento..."
          />
        </FormField>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await agendaService.cancelAppointment(deleteId); // RPC
            toast.success("Agendamento cancelado", {
              description: "O status foi alterado para Cancelado",
            });
            fetchAppointments();
            setDeleteId(null);
          }
        }}
        title="Cancelar Agendamento"
        message="Você tem certeza que deseja cancelar este agendamento? Ele continuará visível com status Cancelado."
      />
    </div>
  );
}