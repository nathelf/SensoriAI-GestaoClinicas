import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ScheduleBlock {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  reason: string | null;
}

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const empty = { day_of_week: "1", start_time: "12:00", end_time: "13:00", reason: "" };

export default function AgendaBloqueios() {
  const { data, loading, create, update, remove } = useCrud<ScheduleBlock>({ table: "schedule_blocks", orderBy: "day_of_week", ascending: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleBlock | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (b: ScheduleBlock) => {
    setEditing(b);
    const st = b.start_time.slice(0, 5);
    const et = b.end_time.slice(0, 5);
    setForm({ day_of_week: String(b.day_of_week), start_time: st, end_time: et, reason: b.reason || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { day_of_week: parseInt(form.day_of_week), start_time: form.start_time, end_time: form.end_time, reason: form.reason || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Bloqueios de Horário</h1>
          <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Bloqueio
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum bloqueio cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map(b => (
              <div key={b.id} className="stat-card !p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{DAYS[b.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)} · {b.reason || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(b.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Bloqueio" : "Novo Bloqueio"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Dia da semana *">
          <FormSelect value={form.day_of_week} onChange={e => set("day_of_week", e.target.value)} required>
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </FormSelect>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início *"><FormInput type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} required /></FormField>
          <FormField label="Fim *"><FormInput type="time" value={form.end_time} onChange={e => set("end_time", e.target.value)} required /></FormField>
        </div>
        <FormField label="Motivo"><FormInput value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Ex: Almoço" /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
