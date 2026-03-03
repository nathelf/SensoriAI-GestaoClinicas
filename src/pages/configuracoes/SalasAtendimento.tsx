import { useState } from "react";
import { motion } from "framer-motion";
import { DoorOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Room {
  id: string;
  name: string;
  capacity_info: string | null;
  active: boolean;
}

const empty = { name: "", capacity_info: "" };

export default function SalasAtendimento() {
  const { data, loading, create, update, remove } = useCrud<Room>({ table: "rooms" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (r: Room) => { setEditing(r); setForm({ name: r.name, capacity_info: r.capacity_info || "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, capacity_info: form.capacity_info || null };
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
            <DoorOpen className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Salas de Atendimento</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova sala
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma sala cadastrada.</div>
        ) : (
          <div className="space-y-2">
            {data.map(r => (
              <div key={r.id} className="stat-card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.capacity_info || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${r.active ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                    {r.active ? "Ativa" : "Inativa"}
                  </span>
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Sala" : "Nova Sala"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <FormField label="Capacidade / Observação"><FormInput value={form.capacity_info} onChange={e => set("capacity_info", e.target.value)} placeholder="Ex: 1 profissional" /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
