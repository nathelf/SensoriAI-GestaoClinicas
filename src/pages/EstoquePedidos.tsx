import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormSelect, FormTextarea } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface StockOrder {
  id: string;
  supplier_id: string | null;
  status: string;
  order_date: string;
  notes: string | null;
}
interface Supplier { id: string; name: string; }

const empty = { supplier_id: "", status: "pendente", order_date: new Date().toISOString().split("T")[0], notes: "" };

export default function EstoquePedidos() {
  const { data, loading, create, update, remove } = useCrud<StockOrder>({ table: "stock_orders", orderBy: "order_date", ascending: false });
  const { data: suppliers } = useCrud<Supplier>({ table: "suppliers" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockOrder | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (o: StockOrder) => {
    setEditing(o);
    setForm({ supplier_id: o.supplier_id || "", status: o.status, order_date: o.order_date, notes: o.notes || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { supplier_id: form.supplier_id || null, status: form.status, order_date: form.order_date, notes: form.notes || null };
    if (editing) await update(editing.id, payload as any);
    else await create(payload as any);
    setSaving(false);
    setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const supplierName = (id: string | null) => suppliers.find(s => s.id === id)?.name || "—";

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Pedidos</h1>
          <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Pedido
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pedido cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {data.map(o => (
              <div key={o.id} className="stat-card !p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Package className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{supplierName(o.supplier_id)}</p>
                    <p className="text-xs text-muted-foreground">{o.order_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${o.status === "entregue" ? "bg-success/20 text-success-foreground" : "bg-info/20 text-info-foreground"}`}>{o.status}</span>
                  <button onClick={() => openEdit(o)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(o.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Pedido" : "Novo Pedido"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Fornecedor"><FormSelect value={form.supplier_id} onChange={e => set("supplier_id", e.target.value)}><option value="">—</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</FormSelect></FormField>
        <FormField label="Data"><FormInput type="date" value={form.order_date} onChange={e => set("order_date", e.target.value)} /></FormField>
        <FormField label="Status"><FormSelect value={form.status} onChange={e => set("status", e.target.value)}><option value="pendente">Pendente</option><option value="em_transito">Em trânsito</option><option value="entregue">Entregue</option><option value="cancelado">Cancelado</option></FormSelect></FormField>
        <FormField label="Observações"><FormTextarea value={form.notes} onChange={e => set("notes", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
