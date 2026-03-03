import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, CheckCircle, Percent, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CrudModal, FormField, FormSelect } from "@/components/CrudModal";

interface UserRow {
  user_id: string;
  display_name: string | null;
  clinic_name: string | null;
  role: string;
  progress_percent: number;
  task_agendamento: boolean;
  task_atendimento: boolean;
  task_venda: boolean;
  task_lembretes: boolean;
  task_documento: boolean;
  reward_claimed: boolean;
}

export default function AdminPanel() {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<{ userId: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState("user");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles, roles, and onboarding data
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, clinic_name");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: onboarding } = await supabase.from("users_onboarding").select("*");

    if (profiles && roles) {
      const merged = profiles.map(p => {
        const role = roles.find(r => r.user_id === p.user_id);
        const ob = onboarding?.find(o => o.user_id === p.user_id);
        return {
          user_id: p.user_id,
          display_name: p.display_name,
          clinic_name: p.clinic_name,
          role: role?.role || "user",
          progress_percent: ob?.progress_percent || 0,
          task_agendamento: ob?.task_agendamento || false,
          task_atendimento: ob?.task_atendimento || false,
          task_venda: ob?.task_venda || false,
          task_lembretes: ob?.task_lembretes || false,
          task_documento: ob?.task_documento || false,
          reward_claimed: ob?.reward_claimed || false,
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setSaving(true);
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", editingRole.userId);
    if (error) toast.error("Erro ao atualizar role");
    else { toast.success("Role atualizado!"); await fetchUsers(); }
    setSaving(false);
    setEditingRole(null);
  };

  if (userRole !== "admin") {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Usuários</p>
          </div>
          <div className="stat-card text-center">
            <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === "admin").length}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
          <div className="stat-card text-center">
            <CheckCircle className="w-5 h-5 text-success-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.progress_percent === 100).length}</p>
            <p className="text-xs text-muted-foreground">Onboarding completo</p>
          </div>
          <div className="stat-card text-center">
            <Percent className="w-5 h-5 text-warning-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.length > 0 ? Math.round(users.reduce((a, u) => a + u.progress_percent, 0) / users.length) : 0}%</p>
            <p className="text-xs text-muted-foreground">Média onboarding</p>
          </div>
        </div>

        {/* Users table */}
        {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div> :
        <div className="stat-card overflow-hidden !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Usuário</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell">Onboarding</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">Tarefas</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className="border-b border-border/20 last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{u.display_name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">{u.clinic_name || ""}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2"><div className="bg-primary rounded-full h-2" style={{ width: `${u.progress_percent}%` }} /></div>
                      <span className="text-xs text-muted-foreground">{u.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex gap-1">
                      {[{ done: u.task_agendamento, label: "AG" }, { done: u.task_atendimento, label: "AT" }, { done: u.task_venda, label: "VE" }, { done: u.task_lembretes, label: "LE" }, { done: u.task_documento, label: "DO" }].map((t, i) => (
                        <span key={i} className={`text-[10px] w-6 h-6 rounded-md flex items-center justify-center font-medium ${t.done ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>{t.label}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => { setEditingRole({ userId: u.user_id, currentRole: u.role }); setNewRole(u.role); }} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </motion.div>

      <CrudModal open={!!editingRole} onClose={() => setEditingRole(null)} title="Alterar Role" onSubmit={handleRoleChange} loading={saving}>
        <FormField label="Role">
          <FormSelect value={newRole} onChange={e => setNewRole(e.target.value)}>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </FormSelect>
        </FormField>
      </CrudModal>
    </div>
  );
}
