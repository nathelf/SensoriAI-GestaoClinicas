import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment { id: string; patient_id: string | null; professional_id: string | null; procedure_id: string | null; room_id: string | null; start_time: string; end_time: string; status: string; notes: string | null; price: number; }
interface Patient { id: string; name: string; }
interface Professional { id: string; name: string; }
interface Procedure { id: string; name: string; price: number; duration_minutes: number; }
interface Room { id: string; name: string; }

const emptyForm = { patient_id: "", professional_id: "", procedure_id: "", room_id: "", start_time: "", end_time: "", status: "agendado", notes: "", price: "0" };

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const { data: allAppts, loading, create, update, remove } = useCrud<Appointment>({ table: "appointments", orderBy: "start_time", ascending: true });
  const { data: patients } = useCrud<Patient>({ table: "patients" });
  const { data: professionals } = useCrud<Professional>({ table: "professionals" });
  const { data: procedures } = useCrud<Procedure>({ table: "procedures" });
  const { data: rooms } = useCrud<Room>({ table: "rooms" });

  const appointments = allAppts.filter(a => a.start_time.startsWith(dateStr));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, start_time: `${dateStr}T09:00`, end_time: `${dateStr}T10:00` });
    setModalOpen(true);
  };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({ patient_id: a.patient_id || "", professional_id: a.professional_id || "", procedure_id: a.procedure_id || "", room_id: a.room_id || "", start_time: a.start_time.slice(0, 16), end_time: a.end_time.slice(0, 16), status: a.status, notes: a.notes || "", price: String(a.price) });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { patient_id: form.patient_id || null, professional_id: form.professional_id || null, procedure_id: form.procedure_id || null, room_id: form.room_id || null, start_time: form.start_time, end_time: form.end_time, status: form.status, notes: form.notes || null, price: parseFloat(form.price) };
    if (editing) await update(editing.id, payload as any); else await create(payload as any);
    setSaving(false); setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const statusColors: Record<string, string> = { agendado: "bg-info/20 text-info-foreground", confirmado: "bg-success/20 text-success-foreground", cancelado: "bg-destructive/20 text-destructive-foreground", realizado: "bg-primary/20 text-primary" };

  const patientName = (id: string | null) => patients.find(p => p.id === id)?.name || "Sem paciente";
  const profName = (id: string | null) => professionals.find(p => p.id === id)?.name || "";
  const procName = (id: string | null) => procedures.find(p => p.id === id)?.name || "";

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Agenda</h1>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Novo Agendamento</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(d => subDays(d, 1))} className="p-2 rounded-xl hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">{format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
          </div>
          <button onClick={() => setCurrentDate(d => addDays(d, 1))} className="p-2 rounded-xl hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        appointments.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhum agendamento para este dia.</div> :
        <div className="space-y-2">
          {appointments.map(a => (
            <div key={a.id} className="stat-card !p-4 flex items-center gap-3">
              <div className="w-1 h-12 rounded-full bg-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{patientName(a.patient_id)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(a.start_time), "HH:mm")} - {format(new Date(a.end_time), "HH:mm")} · {procName(a.procedure_id) || "Sem procedimento"}
                  {profName(a.professional_id) && ` · ${profName(a.professional_id)}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[a.status] || statusColors.agendado}`}>{a.status}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            </div>
          ))}
        </div>}
      </motion.div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Agendamento" : "Novo Agendamento"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Paciente"><FormSelect value={form.patient_id} onChange={e => set("patient_id", e.target.value)}><option value="">Selecione</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormField>
        <FormField label="Procedimento">
          <FormSelect value={form.procedure_id} onChange={e => {
            set("procedure_id", e.target.value);
            const proc = procedures.find(p => p.id === e.target.value);
            if (proc) set("price", String(proc.price));
          }}><option value="">Selecione</option>{procedures.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {Number(p.price).toFixed(2)}</option>)}</FormSelect>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início *"><FormInput type="datetime-local" value={form.start_time} onChange={e => set("start_time", e.target.value)} required /></FormField>
          <FormField label="Fim *"><FormInput type="datetime-local" value={form.end_time} onChange={e => set("end_time", e.target.value)} required /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Profissional"><FormSelect value={form.professional_id} onChange={e => set("professional_id", e.target.value)}><option value="">Selecione</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormField>
          <FormField label="Sala"><FormSelect value={form.room_id} onChange={e => set("room_id", e.target.value)}><option value="">Selecione</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</FormSelect></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor (R$)"><FormInput type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} /></FormField>
          <FormField label="Status"><FormSelect value={form.status} onChange={e => set("status", e.target.value)}><option value="agendado">Agendado</option><option value="confirmado">Confirmado</option><option value="realizado">Realizado</option><option value="cancelado">Cancelado</option></FormSelect></FormField>
        </div>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
