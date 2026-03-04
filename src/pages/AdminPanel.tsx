import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, CheckCircle, Percent, Pencil, Building, Search, DollarSign, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudModal, FormField, FormSelect } from "@/components/CrudModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  email: string | null;
  subscription_active: boolean;
  is_suspended: boolean;
}

interface ClinicaRow {
  id: string;
  nome_clinica: string;
  assinatura_ativa: boolean;
  created_at: string;
  owner_id: string;
  owner_email?: string;
}

interface PerfilRow {
  id: string;
  clinica_id: string;
  nome: string;
}

const PRECO_ASSINATURA = 149.90;

export default function AdminPanel() {
  const { userRole } = useAuth();

  // Data States
  const [users, setUsers] = useState<UserRow[]>([]);
  const [clinicas, setClinicas] = useState<ClinicaRow[]>([]);
  const [perfis, setPerfis] = useState<PerfilRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClinicas, setLoadingClinicas] = useState(false);

  // Search Filters
  const [searchUser, setSearchUser] = useState("");
  const [searchClinica, setSearchClinica] = useState("");

  // Form Control - Edit User
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState("user");
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newSuspended, setNewSuspended] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // Form Control - Edit Clinica
  const [editingClinica, setEditingClinica] = useState<ClinicaRow | null>(null);
  const [newClinicaNome, setNewClinicaNome] = useState("");
  const [newClinicaAssinatura, setNewClinicaAssinatura] = useState(false);
  const [savingClinica, setSavingClinica] = useState(false);

  // Form Control - Create Clinica
  const [showCreateClinica, setShowCreateClinica] = useState(false);
  const [ccNome, setCcNome] = useState("");
  const [ccDonoEmail, setCcDonoEmail] = useState("");
  const [ccDonoNome, setCcDonoNome] = useState("");
  const [ccPass, setCcPass] = useState("");
  const [ccCreating, setCcCreating] = useState(false);

  // Form Control - Create User
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [cuEmail, setCuEmail] = useState("");
  const [cuNome, setCuNome] = useState("");
  const [cuPass, setCuPass] = useState("");
  const [cuClinicaId, setCuClinicaId] = useState("");
  const [cuPerfilId, setCuPerfilId] = useState("");
  const [cuCreating, setCuCreating] = useState(false);


  const fetchData = async () => {
    setLoadingUsers(true);
    setLoadingClinicas(true);

    // Fetch users info
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    const { data: onboarding } = await supabase.from("users_onboarding").select("*");

    if (profiles && roles) {
      const merged = profiles.map(p => {
        const role = roles.find(r => r.user_id === p.user_id);
        const ob = onboarding?.find(o => o.user_id === p.user_id);
        return {
          user_id: p.user_id,
          display_name: p.display_name,
          email: p.email || null,
          clinic_name: p.clinic_name,
          role: role?.role || "user",
          subscription_active: p.subscription_active || false,
          is_suspended: p.is_suspended || false,
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
    setLoadingUsers(false);

    // Fetch clinics
    const { data: clinicasData } = await supabase.from("clinica_config").select("*").order("created_at", { ascending: false });
    if (clinicasData && profiles) {
      const enriched = clinicasData.map(c => {
        const ownerProfile = profiles.find(p => p.user_id === c.owner_id);
        return { ...c, owner_email: ownerProfile?.email || ownerProfile?.display_name || "Desconhecido" };
      });
      setClinicas(enriched);
    }
    setLoadingClinicas(false);

    // Fetch Perfis de Acesso
    const { data: perfisData } = await supabase.from("perfis_acesso").select("*");
    if (perfisData) setPerfis(perfisData);
  };

  useEffect(() => {
    if (userRole === "admin") fetchData();
  }, [userRole]);

  const apiEdge = async (action: string, payload: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-user`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, targetUserId: payload.targetUserId })
    });
    if (!res.ok) throw new Error(await res.text() || 'Erro desconhecido');
    return await res.json();
  };

  // =============== CREATE AÇÕES ===============
  const handleCreateClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccNome || !ccDonoEmail || !ccPass) return toast.error("Preencha todos os campos.");
    setCcCreating(true);
    try {
      // Cria a Auth (e dispara trigger pra criar tenant auto - assumirá "Minha Clínica")
      const result = await apiEdge("create-user", { email: ccDonoEmail, password: ccPass, display_name: ccDonoNome });

      // Delay pequeno pra garantir que o Trigger inseriu no BD
      await new Promise(r => setTimeout(r, 1000));

      // Atualizamos a clinica_config para o nome oficial que foi digitado
      await supabase.from("clinica_config").update({ nome_clinica: ccNome }).eq("owner_id", result.user_id);

      // Atualizamos o profile também caso precisem de cache fácil
      await supabase.from("profiles").update({ clinic_name: ccNome, email: ccDonoEmail }).eq("user_id", result.user_id);

      toast.success("Nova Clínica (Tenant) criada e Dono autorizado com sucesso!");
      setShowCreateClinica(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setCcCreating(false);
  };

  const handleCreateUserAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuEmail || !cuPass || !cuNome || !cuClinicaId || !cuPerfilId) return toast.error("Preencha todos os campos");
    setCuCreating(true);
    try {
      // Cria e já associa. A Edge Function limpa a dummy clinic automaticamente.
      const result = await apiEdge("create-user", {
        email: cuEmail,
        password: cuPass,
        display_name: cuNome,
        clinica_id: cuClinicaId,
        role_id: cuPerfilId
      });
      // Atualiza profile email pra view rápida
      await supabase.from("profiles").update({ email: cuEmail }).eq("user_id", result.user_id);

      toast.success("Usuário Local criado e vinculado com sucesso à Clínica.");
      setShowCreateUser(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setCuCreating(false);
  };


  // =============== UPDATE AÇÕES ===============
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    let errorOccurred = false;

    // Supabase Auth Email Update
    if (editingUser.email !== newEmail && newEmail.trim() !== "") {
      try {
        await apiEdge("update-email", { email: newEmail, targetUserId: editingUser.user_id });
        await supabase.from("profiles").update({ email: newEmail }).eq("user_id", editingUser.user_id);
      } catch (err: any) { toast.error(`Email auth erro: ${err.message}`); errorOccurred = true; }
    }

    // Pass reset
    if (newPass.trim() !== "") {
      try {
        await apiEdge("update-password", { password: newPass, targetUserId: editingUser.user_id });
        toast.success("Senha atualizada no sistema!");
      } catch (err: any) { toast.error(`Falha alterar senha: ${err.message}`); errorOccurred = true; }
    }

    // Role Master
    if (editingUser.role !== newRole) {
      const { error } = await supabase.from("user_roles").update({ role: newRole as "user" | "admin" }).eq("user_id", editingUser.user_id);
      if (error) { toast.error("Role master falhou"); errorOccurred = true; }
    }

    // Suspensão / Inativação (Bloqueia Login em todo SaaS)
    if (editingUser.is_suspended !== newSuspended) {
      try {
        await apiEdge("toggle-suspend", { is_suspended: newSuspended, targetUserId: editingUser.user_id });
        await supabase.from("profiles").update({ is_suspended: newSuspended }).eq("user_id", editingUser.user_id);
      } catch (err: any) { toast.error(`Falha ao suspender: ${err.message}`); errorOccurred = true; }
    }

    if (!errorOccurred) { toast.success("Conta de Usuário atualizada com sucesso!"); }

    await fetchData();
    setSavingUser(false);
    setNewPass("");
    setEditingUser(null);
  };

  const handleEditClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinica) return;
    setSavingClinica(true);

    const { error } = await supabase.from("clinica_config").update({
      nome_clinica: newClinicaNome,
      assinatura_ativa: newClinicaAssinatura
    }).eq("id", editingClinica.id);

    if (error) {
      toast.error("Erro ao salvar clínica: " + error.message);
    } else {
      toast.success("Tenant SaaS atualizado com sucesso!");
      if (editingClinica.assinatura_ativa !== newClinicaAssinatura) {
        // Profile sync for legacy compat
        await supabase.from("profiles").update({ subscription_active: newClinicaAssinatura }).eq("user_id", editingClinica.owner_id);
      }
    }
    await fetchData();
    setSavingClinica(false);
    setEditingClinica(null);
  };

  if (userRole !== "admin") {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center py-20 p-8 stat-card">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">O Painel Plataforma SensoriAI é exclusivo para Proprietários e Administradores da Rede.</p>
        </div>
      </div>
    );
  }

  // Filtragem
  const filteredClinicas = clinicas.filter(c =>
    c.nome_clinica?.toLowerCase().includes(searchClinica.toLowerCase()) ||
    c.owner_email?.toLowerCase().includes(searchClinica.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const activeClinics = clinicas.filter(c => c.assinatura_ativa).length;
  const mrrEstimado = activeClinics * PRECO_ASSINATURA;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SensoriAI Master</h1>
              <p className="text-sm font-medium text-muted-foreground">Sistema central de ERP Multi-Locação e Credenciais SaaS.</p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          <div className="stat-card p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
            <Building className="w-6 h-6 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">{clinicas.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Total de Tenants/Clínicas</p>
          </div>

          <div className="stat-card p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors"></div>
            <DollarSign className="w-6 h-6 text-success-foreground mb-3" />
            <p className="text-3xl font-bold text-success-foreground mb-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(mrrEstimado)}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-success-foreground/70 font-bold">MRR Estimado (Recorrente)</p>
          </div>

          <div className="stat-card p-5">
            <CheckCircle className="w-6 h-6 text-success-foreground mb-3" />
            <div className="flex items-end gap-2 mb-1">
              <p className="text-3xl font-bold text-foreground">{activeClinics}</p>
              <span className="text-sm font-semibold text-muted-foreground pb-1">/ {clinicas.length}</span>
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Assinaturas Ativas Verificadas</p>
          </div>

          <div className="stat-card p-5">
            <Users className="w-6 h-6 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">{users.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Contas Individuais Cidadãs</p>
          </div>
        </div>

        <Tabs defaultValue="clinicas" className="w-full">
          <TabsList className="flex w-full overflow-x-auto lg:w-fit bg-card border border-border/50 p-1 rounded-xl mb-6 shadow-sm">
            <TabsTrigger value="clinicas" className="px-6 py-2.5 rounded-lg font-semibold tracking-wide">💼 Tenants & Gestão Empresarial</TabsTrigger>
            <TabsTrigger value="usuarios" className="px-6 py-2.5 rounded-lg font-semibold tracking-wide">👥 Contas Individuais Globais</TabsTrigger>
          </TabsList>

          {/* ABA: CLÍNICAS */}
          <TabsContent value="clinicas" className="space-y-4 outline-none">

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do negócio ou host do tenant..."
                  className="w-full pl-9 pr-4 h-10 bg-background border border-border/50 text-foreground text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  value={searchClinica}
                  onChange={e => setSearchClinica(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowCreateClinica(true)}
                className="w-full sm:w-auto h-10 px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Registrar Novo Tenant
              </button>
            </div>

            {loadingClinicas ? (
              <div className="text-center py-16 text-muted-foreground text-sm stat-card mt-4">Sincronizando registros da rede...</div>
            ) : (
              <div className="stat-card overflow-x-auto !p-0 mt-4 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 uppercase tracking-wider text-[11px]">
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Razão / Nome Fantasia</th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Conta Administradora</th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Estado do Sistema</th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Registrada em</th>
                      <th className="py-4 px-6 text-right">Ação Master</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filteredClinicas.map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                              {c.nome_clinica?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground text-[15px]">{c.nome_clinica}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/50 flex-shrink-0 rounded-full"></div>
                          {c.owner_email}
                        </td>
                        <td className="py-4 px-6">
                          {c.assinatura_ativa ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success-foreground text-xs font-bold tracking-wider border border-success/30 shadow-sm">
                              🌟 SensoriAI Pro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-muted-foreground text-xs font-bold tracking-wider shadow-sm">
                              🔒 Básico Bloqueado
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs font-medium text-muted-foreground">
                          {c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy, HH:mm', { locale: ptBR }) : '-'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setEditingClinica(c);
                              setNewClinicaNome(c.nome_clinica);
                              setNewClinicaAssinatura(c.assinatura_ativa);
                            }}
                            className="p-2 rounded-lg bg-background border border-border/50 hover:bg-muted text-foreground transition-colors inline-flex items-center gap-2 shadow-sm font-semibold text-xs"
                          >
                            <Settings className="w-3.5 h-3.5" /> Forçar Regras
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* ABA: USUÁRIOS */}
          <TabsContent value="usuarios" className="space-y-4 outline-none">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Busca por nome completo ou email unitário..."
                  className="w-full pl-9 pr-4 h-10 bg-background border border-border/50 text-foreground text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="w-full sm:w-auto h-10 px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Users className="w-4 h-4" /> Forjar Novo Identificador
              </button>
            </div>

            {loadingUsers ? <div className="text-center py-16 text-muted-foreground text-sm stat-card mt-4">Sincronizando contas na rede auth...</div> :
              <div className="stat-card overflow-x-auto !p-0 mt-4 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 uppercase tracking-wider text-[11px]">
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Status Cidadão</th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold">Level Matriz do Usuário</th>
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold hidden sm:table-cell">Integração do Cidadão</th>
                      <th className="py-4 px-6 text-right">Auditoria / Bloqueio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filteredUsers.map(u => (
                      <tr key={u.user_id} className={`hover:bg-muted/30 transition-colors ${u.is_suspended ? 'opacity-50' : ''}`}>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0 ${u.is_suspended ? 'bg-destructive' : 'bg-success'}`}></div>
                          <div>
                            <p className="font-bold text-foreground text-[14px]">{u.display_name || "Membro Anônimo"}</p>
                            <p className="text-xs font-mono tracking-tight text-muted-foreground mt-0.5">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-sm border ${u.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted border-border/50 text-muted-foreground"}`}>
                            {u.role === "admin" ? <Shield className="w-3 h-3" /> : ''}
                            {u.role === "admin" ? "SuperAdmin Host" : "Funcionário Standard"}
                          </span>
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <div className="flex items-center gap-3 max-w-[150px]">
                            <div className="flex-1 bg-muted rounded-full h-1.5 shadow-inner overflow-hidden border border-border/30">
                              <div className="bg-primary h-full transition-all" style={{ width: `${u.progress_percent}%` }} />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground font-mono">{u.progress_percent}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setNewRole(u.role);
                              setNewEmail(u.email || "");
                              setNewSuspended(u.is_suspended);
                            }}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-muted hover:border-border text-foreground transition-colors inline-block ml-auto shadow-sm"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ===================== MODAIS ===================== */}

      {/* CREATE CLINICA MODAL */}
      <CrudModal open={showCreateClinica} onClose={() => setShowCreateClinica(false)} title="Lançar Novo Tenant SaaS" onSubmit={handleCreateClinica} loading={ccCreating}>
        <div className="px-1 py-2">
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-1"><Building className="w-4 h-4" /> Nova Instância B2B</h4>
            <p className="text-[12px] text-foreground font-medium leading-relaxed">
              Isso registrará automaticamente um Tenant no Banco de Dados para um novo cliente corporativo, com tabelas e acesso isolados de todos os outros por diretrizes de Row Level Security.
            </p>
          </div>

          <FormField label="Nome da Empresa (Público)" hint="Aparecerá para os funcionários deste local na interface isolada deles.">
            <input type="text" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl focus:outline-none focus:border-primary transition-colors" value={ccNome} onChange={e => setCcNome(e.target.value)} required />
          </FormField>

          <FormField label="E-mail de Acesso do Administrador da Empresa">
            <input type="email" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl focus:outline-none focus:border-primary transition-colors" value={ccDonoEmail} onChange={e => setCcDonoEmail(e.target.value)} required />
          </FormField>

          <FormField label="Nome do Dono (Opcional)">
            <input type="text" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl focus:outline-none focus:border-primary transition-colors" value={ccDonoNome} onChange={e => setCcDonoNome(e.target.value)} />
          </FormField>

          <FormField label="Definir Senha Temporária Inicial" hint="Mínimo 6 caracteres. Após o login, ele mesmo pode alterar a senha pelo painel dele.">
            <input type="password" minLength={6} className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl focus:outline-none focus:border-primary transition-colors" value={ccPass} onChange={e => setCcPass(e.target.value)} required />
          </FormField>
        </div>
      </CrudModal>

      {/* CREATE USER MODAL */}
      <CrudModal open={showCreateUser} onClose={() => setShowCreateUser(false)} title="Forjar Funcionário Limpo" onSubmit={handleCreateUserAndLink} loading={cuCreating}>
        <div className="px-1 py-2">
          <FormField label="Nome do Funcionário">
            <input type="text" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl" value={cuNome} onChange={e => setCuNome(e.target.value)} required />
          </FormField>
          <FormField label="Credencial Email">
            <input type="email" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl" value={cuEmail} onChange={e => setCuEmail(e.target.value)} required />
          </FormField>
          <FormField label="Senha Inicial">
            <input type="password" minLength={6} className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl" value={cuPass} onChange={e => setCuPass(e.target.value)} required />
          </FormField>

          <div className="border-t border-border/40 mt-5 pt-4 pb-2">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Mapeamento Geográfico no SaaS</h4>
            <FormField label="Vincular a Qual Clínica Matriz?">
              <FormSelect value={cuClinicaId} onChange={e => setCuClinicaId(e.target.value)} required>
                <option value="">Selecione o Tenant</option>
                {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome_clinica} ({c.owner_email})</option>)}
              </FormSelect>
            </FormField>

            {cuClinicaId && (
              <FormField label="Acessos / Role Local">
                <FormSelect value={cuPerfilId} onChange={e => setCuPerfilId(e.target.value)} required>
                  <option value="">Selecione uma Role dessa Clínica</option>
                  {perfis.filter(p => p.clinica_id === cuClinicaId).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </FormSelect>
              </FormField>
            )}
          </div>
        </div>
      </CrudModal>


      {/* MODAL EDIÇÃO CLÍNICA / ALAVANCAS ADMINISTRATIVAS */}
      <CrudModal open={!!editingClinica} onClose={() => setEditingClinica(null)} title="Controle do Tenant" onSubmit={handleEditClinica} loading={savingClinica}>
        <FormField label="Nome Público do Tenant (Clínica)">
          <input type="text" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground font-bold text-lg rounded-xl focus:outline-none focus:border-primary transition-colors" value={newClinicaNome} onChange={e => setNewClinicaNome(e.target.value)} />
        </FormField>

        <FormField label="Assinatura SensoriAI Pro (Módulos Premium)" hint="As Views Premium do app do cliente sumirão instantaneamente se isto for removido.">
          <div className={`flex items-center gap-4 p-4 rounded-xl border border-border/40 transition-colors ${newClinicaAssinatura ? 'bg-success/5 border-success/30' : 'bg-muted/30'}`}>
            <button
              type="button"
              onClick={() => setNewClinicaAssinatura(!newClinicaAssinatura)}
              className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${newClinicaAssinatura ? 'bg-success' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${newClinicaAssinatura ? 'left-[32px]' : 'left-1'}`} />
            </button>
            <div className="flex-1">
              <span className={`text-[15px] font-bold tracking-tight block ${newClinicaAssinatura ? 'text-success-foreground' : 'text-foreground'}`}>
                {newClinicaAssinatura ? "ATIVO ✅ PLANO PRO" : "BLOQUEADO 🔒 / EM ATRASO"}
              </span>
            </div>
          </div>
        </FormField>
      </CrudModal>

      {/* MODAL EDIÇÃO USUÁRIO / EXTREME ENFORCEMENT */}
      <CrudModal open={!!editingUser} onClose={() => setEditingUser(null)} title="Credenciais Individuais" onSubmit={handleEditUser} loading={savingUser}>
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField label="E-mail Matriz do Indivíduo">
              <input type="email" className="w-full font-mono text-sm h-11 px-4 bg-background border border-border/50 text-foreground rounded-xl" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </FormField>
          </div>
        </div>

        <FormField label="Modificar Senha Brutalmente" hint="Se preenchido e salvo, a senha atual deste usuário é rasgada e substituída na hora. Deixe em branco para ignorar.">
          <input type="password" placeholder="Uma nova senha (no mínimo 6 dígitos)" className="w-full h-11 px-4 bg-background border border-border/50 text-foreground text-sm rounded-xl focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all placeholder:text-muted-foreground/40" value={newPass} onChange={e => setNewPass(e.target.value)} />
        </FormField>

        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 my-4">
          <FormField label="Extrema Sanção (Banimento Login)" hint="O usuário nem passará da tela de Loading se isto estiver ativo. É barrado no gate da API.">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewSuspended(!newSuspended)}
                className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${newSuspended ? 'bg-destructive' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${newSuspended ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
              <span className={`text-sm font-bold tracking-wide block ${newSuspended ? 'text-destructive' : 'text-foreground'}`}>
                {newSuspended ? "CONTA BANIIDA PERMANENTE" : "Conta Ativa Ordinária"}
              </span>
            </div>
          </FormField>
        </div>

        <div className="border-t border-border/40 pt-5">
          <FormField label="Privilégio Cidadão (Role de Nuvem Máxima)">
            <FormSelect value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="user">USER (Visão Limitada pela Clínica)</option>
              <option value="admin">ROOT / ADMIN (Dono de Plataforma SaaS)</option>
            </FormSelect>
          </FormField>
        </div>
      </CrudModal>
    </div>
  );
}
