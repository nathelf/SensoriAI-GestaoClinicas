import { useState } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { CrudModal, FormField, FormInput, FormTextarea, FormSelect } from "@/components/CrudModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Product { id: string; name: string; description: string | null; sku: string | null; unit: string; cost_price: number; sale_price: number; stock_quantity: number; min_stock: number; supplier_id: string | null; active: boolean; }
interface Supplier { id: string; name: string; }
const empty = { name: "", description: "", sku: "", unit: "un", cost_price: "0", sale_price: "0", stock_quantity: "0", min_stock: "0", supplier_id: "" };

export default function Estoque() {
  const { data, loading, create, update, remove } = useCrud<Product>({ table: "products" });
  const { data: suppliers } = useCrud<Supplier>({ table: "suppliers" });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", sku: p.sku || "", unit: p.unit, cost_price: String(p.cost_price), sale_price: String(p.sale_price), stock_quantity: String(p.stock_quantity), min_stock: String(p.min_stock), supplier_id: p.supplier_id || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { name: form.name, description: form.description || null, sku: form.sku || null, unit: form.unit, cost_price: parseFloat(form.cost_price), sale_price: parseFloat(form.sale_price), stock_quantity: parseFloat(form.stock_quantity), min_stock: parseFloat(form.min_stock), supplier_id: form.supplier_id || null };
    if (editing) await update(editing.id, payload as any); else await create(payload as any);
    setSaving(false); setModalOpen(false);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Estoque</h1>
          <button onClick={openCreate} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Novo Produto</button>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Nenhum produto cadastrado.</div> :
        <div className="space-y-2">
          {filtered.map(item => {
            const isLow = Number(item.stock_quantity) <= Number(item.min_stock);
            return (
              <div key={item.id} className={`stat-card !p-4 flex items-center gap-3 ${isLow ? "border-destructive/30" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLow ? "bg-destructive/20" : "bg-primary/10"}`}>
                  {isLow ? <AlertTriangle className="w-4 h-4 text-destructive-foreground" /> : <Package className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku || "Sem SKU"} · R$ {Number(item.sale_price).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isLow ? "text-destructive-foreground" : "text-foreground"}`}>{item.stock_quantity} {item.unit}</p>
                  {isLow && <p className="text-[10px] text-destructive-foreground">Abaixo do mínimo</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive-foreground" /></button>
                </div>
              </div>
            );
          })}
        </div>}
      </motion.div>
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Produto" : "Novo Produto"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Nome *"><FormInput value={form.name} onChange={e => set("name", e.target.value)} required /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="SKU"><FormInput value={form.sku} onChange={e => set("sku", e.target.value)} /></FormField>
          <FormField label="Unidade"><FormSelect value={form.unit} onChange={e => set("unit", e.target.value)}><option value="un">Unidade</option><option value="ml">mL</option><option value="g">Gramas</option><option value="cx">Caixa</option><option value="fr">Frasco</option></FormSelect></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Preço de Custo"><FormInput type="number" step="0.01" value={form.cost_price} onChange={e => set("cost_price", e.target.value)} /></FormField>
          <FormField label="Preço de Venda"><FormInput type="number" step="0.01" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Qtd em Estoque"><FormInput type="number" value={form.stock_quantity} onChange={e => set("stock_quantity", e.target.value)} /></FormField>
          <FormField label="Estoque Mínimo"><FormInput type="number" value={form.min_stock} onChange={e => set("min_stock", e.target.value)} /></FormField>
        </div>
        <FormField label="Fornecedor">
          <FormSelect value={form.supplier_id} onChange={e => set("supplier_id", e.target.value)}>
            <option value="">Nenhum</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FormSelect>
        </FormField>
        <FormField label="Descrição"><FormTextarea value={form.description} onChange={e => set("description", e.target.value)} /></FormField>
      </CrudModal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
