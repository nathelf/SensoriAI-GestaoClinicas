import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Sale { id: string; patient_id: string | null; professional_id: string | null; payment_method_id: string | null; total: number; discount?: number; status?: string; notes: string | null; sale_date: string; }
interface Patient { id: string; name: string; }
interface Professional { id: string; name: string; }
interface PaymentMethod { id: string; name: string; }

const empty = { patient_id: "", professional_id: "", payment_method_id: "", total: "0", discount: "0", status: "finalizada", notes: "" };

export default function Vendas() {
  const { data, loading, create, update, remove } = useCrud<Sale>({ table: "sales" });
  const { data: patients } = useCrud<Patient>({ table: "patients" });
  const { data: professionals } = useCrud<Professional>({ table: "professionals" });
  const { data: paymentMethods } = useCrud<PaymentMethod>({ table: "payment_methods" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s: Sale) => { setEditing(s); setForm({ patient_id: s.patient_id || "", professional_id: s.professional_id || "", payment_method_id: s.payment_method_id || "", total: String(s.total), discount: String(s.discount ?? 0), status: s.status ?? "finalizada", notes: s.notes || "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { patient_id: form.patient_id || null, professional_id: form.professional_id || null, payment_method_id: form.payment_method_id || null, total: parseFloat(form.total), discount: parseFloat(form.discount) || 0, status: form.status || "finalizada", notes: form.notes || null };
    if (editing) await update(editing.id, payload as any); else await create(payload as any);
    setSaving(false); setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const patientName = (id: string | null) => patients.find(p => p.id === id)?.name || "Cliente avulso";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /><h1 className="text-xl font-bold text-foreground">Vendas</h1></div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Nova Venda</button>
        </div>
        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        data.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma venda registrada.</div> :
        <div className="space-y-2">
          {data.map(s => (
            <div key={s.id} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{patientName(s.patient_id)}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.sale_date).toLocaleDateString("pt-BR")} · {s.status ?? "finalizada"}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">R$ {Number(s.total).toFixed(2)}</p>
                  {(Number(s.discount ?? 0) > 0) && <p className="text-[10px] text-muted-foreground">Desc: R$ {Number(s.discount).toFixed(2)}</p>}
                </div>
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
              </div>
            </div>
          ))}
        </div>}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Venda" : "Nova Venda"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Paciente"><FormSelect value={form.patient_id} onChange={e => set("patient_id", e.target.value)}><option value="">Cliente avulso</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormField>
        <FormField label="Profissional"><FormSelect value={form.professional_id} onChange={e => set("professional_id", e.target.value)}><option value="">Nenhum</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Total (R$) *"><FormInput type="number" step="0.01" value={form.total} onChange={e => set("total", e.target.value)} required /></FormField>
          <FormField label="Desconto (R$)"><FormInput type="number" step="0.01" value={form.discount} onChange={e => set("discount", e.target.value)} /></FormField>
        </div>
        <FormField label="Método de Pagamento"><FormSelect value={form.payment_method_id} onChange={e => set("payment_method_id", e.target.value)}><option value="">Nenhum</option>{paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</FormSelect></FormField>
        <FormField label="Status"><FormSelect value={form.status} onChange={e => set("status", e.target.value)}><option value="finalizada">Finalizada</option><option value="pendente">Pendente</option><option value="cancelada">Cancelada</option></FormSelect></FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
