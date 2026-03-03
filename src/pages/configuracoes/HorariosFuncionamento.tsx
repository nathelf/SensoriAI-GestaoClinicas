import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface BusinessHour {
  id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
}

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const empty = { day_of_week: "1", open_time: "08:00", close_time: "18:00", closed: "false" };

export default function HorariosFuncionamento() {
  const { data, loading, create, update, remove } = useCrud<BusinessHour>({ table: "business_hours", orderBy: "day_of_week", ascending: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessHour | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (h: BusinessHour) => {
    setEditing(h);
    setForm({
      day_of_week: String(h.day_of_week),
      open_time: h.open_time?.slice(0, 5) || "08:00",
      close_time: h.close_time?.slice(0, 5) || "18:00",
      closed: h.closed ? "true" : "false",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const closed = form.closed === "true";
    const payload = {
      day_of_week: parseInt(form.day_of_week),
      open_time: closed ? null : form.open_time,
      close_time: closed ? null : form.close_time,
      closed,
    };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Horários de Funcionamento</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo horário
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum horário cadastrado. Adicione os dias de funcionamento.</div>
        ) : (
          <div className="space-y-2">
            {data.map(h => (
              <div key={h.id} className="stat-card !p-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${h.closed ? "text-muted-foreground" : "text-foreground"}`}>{DAYS[h.day_of_week]}</span>
                <div className="flex items-center gap-2">
                  {h.closed ? (
                    <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">Fechado</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">{h.open_time?.slice(0, 5)} - {h.close_time?.slice(0, 5)}</span>
                  )}
                  <button onClick={() => openEdit(h)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(h.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Horário" : "Novo Horário"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Dia *">
          <select value={form.day_of_week} onChange={e => set("day_of_week", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm">
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </FormField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.closed === "true"} onChange={e => set("closed", e.target.checked ? "true" : "false")} className="rounded border-border" />
          <span className="text-sm text-foreground">Fechado neste dia</span>
        </label>
        {form.closed !== "true" && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Abertura"><FormInput type="time" value={form.open_time} onChange={e => set("open_time", e.target.value)} /></FormField>
            <FormField label="Fechamento"><FormInput type="time" value={form.close_time} onChange={e => set("close_time", e.target.value)} /></FormField>
          </div>
        )}
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
