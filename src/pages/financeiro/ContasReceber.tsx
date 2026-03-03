import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus, Pencil, Trash2, Check } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface AccountReceivable { id: string; description: string; amount: number; due_date: string; paid_date: string | null; status: string; notes: string | null; patient_id: string | null; category_id: string | null; }
interface Patient { id: string; name: string; }
interface Category { id: string; name: string; category_type: string; }
const empty = { description: "", amount: "0", due_date: "", status: "pendente", notes: "", patient_id: "", category_id: "" };

export default function ContasReceber() {
  const { data, loading, create, update, remove } = useCrud<AccountReceivable>({ table: "accounts_receivable", orderBy: "due_date", ascending: true });
  const { data: patients } = useCrud<Patient>({ table: "patients" });
  const { data: categories } = useCrud<Category>({ table: "financial_categories" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountReceivable | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const receiveCategories = categories.filter(c => c.category_type === "receita");
  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: AccountReceivable) => { setEditing(p); setForm({ description: p.description, amount: String(p.amount), due_date: p.due_date, status: p.status, notes: p.notes || "", patient_id: p.patient_id || "", category_id: p.category_id || "" }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { description: form.description, amount: parseFloat(form.amount), due_date: form.due_date, status: form.status, notes: form.notes || null, patient_id: form.patient_id || null, category_id: form.category_id || null };
    if (editing) await update(editing.id, payload as any); else await create(payload as any);
    setSaving(false); setModalOpen(false);
  };

  const markPaid = async (id: string) => { await update(id, { status: "pago", paid_date: new Date().toISOString().split("T")[0] } as any); };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const statusColors: Record<string, string> = { pendente: "bg-warning/20 text-warning-foreground", vencido: "bg-destructive/20 text-destructive-foreground", pago: "bg-success/20 text-success-foreground" };
  const getStatus = (item: AccountReceivable) => {
    if (item.status === "pago") return "pago";
    if (new Date(item.due_date) < new Date()) return "vencido";
    return "pendente";
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-primary" /><h1 className="text-xl font-bold text-foreground">Contas a Receber</h1></div>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Nova</button>
        </div>
        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        data.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma conta a receber.</div> :
        <div className="stat-card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/30">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Descrição</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Valor</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell">Vencimento</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="py-3 px-4"></th>
            </tr></thead>
            <tbody>
              {data.map(item => {
                const s = getStatus(item);
                return (
                  <tr key={item.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{item.description}</td>
                    <td className="py-3 px-4 text-success-foreground font-semibold">R$ {Number(item.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{item.due_date ? new Date(item.due_date).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[s]}`}>{s}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {s !== "pago" && <button onClick={() => markPaid(item.id)} className="p-1.5 rounded-lg hover:bg-success/20" title="Marcar como pago"><Check className="w-3.5 h-3.5 text-success-foreground" /></button>}
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Conta" : "Nova Conta a Receber"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Descrição *"><FormInput value={form.description} onChange={e => set("description", e.target.value)} required /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor (R$) *"><FormInput type="number" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} required /></FormField>
          <FormField label="Vencimento *"><FormInput type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} required /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Paciente"><FormSelect value={form.patient_id} onChange={e => set("patient_id", e.target.value)}><option value="">Nenhum</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</FormSelect></FormField>
          <FormField label="Categoria"><FormSelect value={form.category_id} onChange={e => set("category_id", e.target.value)}><option value="">Nenhuma</option>{receiveCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</FormSelect></FormField>
        </div>
        <FormField label="Status"><FormSelect value={form.status} onChange={e => set("status", e.target.value)}><option value="pendente">Pendente</option><option value="pago">Pago</option></FormSelect></FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
