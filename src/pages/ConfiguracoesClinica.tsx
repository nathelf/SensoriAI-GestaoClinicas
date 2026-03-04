import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Users, Shield, Building, Save, Plus, Trash2, Key, Loader2, PlaySquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudModal, FormField, FormSelect } from "@/components/CrudModal";

// --- Types temporarios até a geração do DB Sync
interface ClinicaConfig {
    id: string;
    nome_clinica: string;
    assinatura_ativa: boolean;
}

interface PerfilAcesso {
    id: string;
    nome: string;
    descricao: string;
}

interface ModuloPermissao {
    id?: string;
    perfil_acesso_id: string;
    modulo: string;
    acesso_liberado: boolean;
}

interface FuncionarioRow {
    id: string;
    user_id: string;
    perfil_nome: string | null;
    perfil_id: string | null;
    status: string;
    user_email?: string;
    user_name?: string;
}

const MODULOS_SISTEMA = [
    { id: 'dashboard', nome: 'Dashboard e Resumo', icone: PlaySquare },
    { id: 'agenda', nome: 'Agenda e Calendário', icone: PlaySquare },
    { id: 'prontuarios', nome: 'Prontuários Eletrônicos', icone: PlaySquare },
    { id: 'financeiro', nome: 'Financeiro e Caixa', icone: PlaySquare },
    { id: 'estoque', nome: 'Controle de Estoque', icone: PlaySquare },
    { id: 'configuracoes', nome: 'Configurações da Clínica', icone: Settings },
];

export default function ConfiguracoesClinica() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [clinica, setClinica] = useState<ClinicaConfig | null>(null);
    const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
    const [funcionarios, setFuncionarios] = useState<FuncionarioRow[]>([]);

    // States Modal Perfil
    const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
    const [editingPerfil, setEditingPerfil] = useState<PerfilAcesso | null>(null);
    const [perfilNome, setPerfilNome] = useState("");
    const [perfilDescricao, setPerfilDescricao] = useState("");
    const [permissoesAtuais, setPermissoesAtuais] = useState<Record<string, boolean>>({});

    // States Modal Funcionario
    const [isFuncModalOpen, setIsFuncModalOpen] = useState(false);
    const [novoFuncEmail, setNovoFuncEmail] = useState("");
    const [novoFuncPerfil, setNovoFuncPerfil] = useState("");

    const carregarDados = async () => {
        setLoading(true);
        try {
            // 1. Puxar a clinica do usuario atual
            const { data: vinculo } = await supabase.from("usuario_clinica").select("clinica_id").eq("user_id", user?.id).maybeSingle();
            if (!vinculo) {
                setLoading(false);
                return;
            }

            const { data: clinicaData } = await supabase.from("clinica_config").select("*").eq("id", vinculo.clinica_id).single();
            setClinica(clinicaData);

            // 2. Puxar as roles/perfis dessa clinica
            const { data: perfisData } = await supabase.from("perfis_acesso").select("*").eq("clinica_id", vinculo.clinica_id);
            setPerfis(perfisData || []);

            // 3. Puxar os vinculos/funcionarios
            const { data: funcsData } = await supabase.from("usuario_clinica").select("id, user_id, perfil_acesso_id, status").eq("clinica_id", vinculo.clinica_id);

            if (funcsData) {
                // Enriquecer com nomes/emails (Idealmente via Edge Function ou View, mas vamos tentar ler de profiles se a RLS permitir)
                // Por ora, vamos mapear o perfil nome
                const enriched = funcsData.map(f => ({
                    ...f,
                    perfil_id: f.perfil_acesso_id,
                    perfil_nome: perfisData?.find(p => p.id === f.perfil_acesso_id)?.nome || "Sem Perfil"
                }));
                setFuncionarios(enriched as FuncionarioRow[]);
            }

        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar dados da clínica");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) carregarDados();
    }, [user]);

    // =============== SALVAR DADOS CLÍNICA ===============
    const [savingClinica, setSavingClinica] = useState(false);
    const [nomeClinica, setNomeClinica] = useState("");

    useEffect(() => {
        if (clinica) setNomeClinica(clinica.nome_clinica);
    }, [clinica]);

    const handleSalvarClinica = async () => {
        if (!clinica) return;
        setSavingClinica(true);
        const { error } = await supabase.from("clinica_config").update({ nome_clinica: nomeClinica }).eq("id", clinica.id);
        if (error) toast.error("Erro ao salvar clínica = " + error.message);
        else toast.success("Dados da clínica salvos!");
        setSavingClinica(false);
    };

    // =============== GESTÃO DE PERFIS (ROLES) E MÓDULOS ===============
    const abrirModalPerfil = async (perfil?: PerfilAcesso) => {
        if (perfil) {
            setEditingPerfil(perfil);
            setPerfilNome(perfil.nome);
            setPerfilDescricao(perfil.descricao || "");

            // Carregar missoes do banco
            const { data: mods } = await supabase.from("modulos_permissao").select("*").eq("perfil_acesso_id", perfil.id);
            const permMap: Record<string, boolean> = {};
            MODULOS_SISTEMA.forEach(m => permMap[m.id] = false); // zera tudo
            mods?.forEach((m: any) => permMap[m.modulo] = m.acesso_liberado);
            setPermissoesAtuais(permMap);
        } else {
            setEditingPerfil(null);
            setPerfilNome("");
            setPerfilDescricao("");
            const permMap: Record<string, boolean> = {};
            MODULOS_SISTEMA.forEach(m => permMap[m.id] = false);
            setPermissoesAtuais(permMap);
        }
        setIsPerfilModalOpen(true);
    };

    const handleSalvarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clinica) return;

        // 1. Salvar ou criar Perfil na tabela `perfis_acesso`
        let targetId = editingPerfil?.id;
        if (!targetId) { // Criando novo
            const { data, error } = await supabase.from("perfis_acesso").insert({
                clinica_id: clinica.id,
                nome: perfilNome,
                descricao: perfilDescricao
            }).select("id").single();
            if (error) return toast.error(error.message);
            targetId = data.id;
        } else { // Atualizando
            const { error } = await supabase.from("perfis_acesso").update({
                nome: perfilNome,
                descricao: perfilDescricao
            }).eq("id", targetId);
            if (error) return toast.error(error.message);
        }

        // 2. Salvar permissoes na tabela `modulos_permissao`
        const upserts = Object.keys(permissoesAtuais).map(mod => ({
            perfil_acesso_id: targetId,
            modulo: mod,
            acesso_liberado: permissoesAtuais[mod]
        }));

        // o Supabase Upsert requer match nas colunas conflict (configurado UNIQUE na migration)
        const { error: permErr } = await supabase.from("modulos_permissao").upsert(upserts, { onConflict: 'perfil_acesso_id, modulo' });
        if (permErr) toast.error("Perfis criados mas falha ao salvar permissões: " + permErr.message);
        else toast.success("Perfil e permissões salvas com sucesso!");

        setIsPerfilModalOpen(false);
        carregarDados();
    };

    const handleTogglePermissao = (moduloId: string) => {
        setPermissoesAtuais(prev => ({
            ...prev,
            [moduloId]: !prev[moduloId]
        }));
    };

    const apagarPerfil = async (id: string) => {
        if (!confirm("Tem certeza? Usuários com esse perfil ficarão sem acesso.")) return;
        await supabase.from("perfis_acesso").delete().eq("id", id);
        toast.success("Perfil removido.");
        carregarDados();
    };

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Configurações de Administrador</h1>
                        <p className="text-sm text-muted-foreground">Gerencie assinaturas, permissões e sua equipe local.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        Carregando dados da clínica...
                    </div>
                ) : !clinica ? (
                    <div className="text-center py-20 text-muted-foreground">
                        Você não está vinculado a nenhuma clínica.
                    </div>
                ) : (
                    <Tabs defaultValue="perfis" className="w-full">
                        <TabsList className="grid w-full lg:w-[600px] grid-cols-3 mb-6">
                            <TabsTrigger value="clinica">Dados Corporativos</TabsTrigger>
                            <TabsTrigger value="perfis">Perfis (Roles)</TabsTrigger>
                            <TabsTrigger value="equipe">Equipe</TabsTrigger>
                        </TabsList>

                        {/* ABA: DADOS DA CLÍNICA */}
                        <TabsContent value="clinica" className="outline-none">
                            <div className="stat-card !p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nome Oficial da Clínica</label>
                                    <input
                                        value={nomeClinica}
                                        onChange={e => setNomeClinica(e.target.value)}
                                        className="w-full max-w-md px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Status da Assinatura (Módulos Globais)</label>
                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${clinica.assinatura_ativa ? 'bg-success/10 text-success-foreground' : 'bg-warning/10 text-warning-foreground'}`}>
                                        {clinica.assinatura_ativa ? '🌟 Plano Premium Ativo' : '🔒 Plano Básico / Trial'}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 max-w-md">Para habilitar módulos como Financeiro para seus funcionários, certifique-se que o plano da sua clínica contemple esses módulos.</p>
                                </div>
                                <div className="pt-4 border-t border-border/40">
                                    <button onClick={handleSalvarClinica} disabled={savingClinica} className="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                                        {savingClinica ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Informações
                                    </button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ABA: GESTÃO DE PERFIS (RBAC) */}
                        <TabsContent value="perfis" className="outline-none">
                            <div className="stat-card !p-0 overflow-hidden">
                                <div className="p-4 lg:p-6 flex justify-between items-center border-b border-border/40">
                                    <div>
                                        <h3 className="font-semibold text-foreground">Perfis de Acesso (Roles)</h3>
                                        <p className="text-xs text-muted-foreground">Crie papéis (ex: Médico, Recepcionista) e atribua a eles acesso aos módulos do sistema.</p>
                                    </div>
                                    <button onClick={() => abrirModalPerfil()} className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                        <Plus className="w-4 h-4" /> Novo Perfil
                                    </button>
                                </div>

                                <div className="divide-y divide-border/20">
                                    {perfis.map(p => (
                                        <div key={p.id} className="p-4 lg:px-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div>
                                                <p className="font-medium text-foreground">{p.nome}</p>
                                                <p className="text-xs text-muted-foreground">{p.descricao || 'Sem descrição'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => abrirModalPerfil(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5">
                                                    <Shield className="w-4 h-4" /> Módulos Liberados
                                                </button>
                                                {perfis.length > 1 && (
                                                    <button onClick={() => apagarPerfil(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {perfis.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm">Nenhum perfil cadastrado. Crie um para começar!</div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ABA: FUNCIONÁRIOS */}
                        <TabsContent value="equipe" className="outline-none">
                            <div className="stat-card !p-0 overflow-hidden">
                                <div className="p-4 lg:p-6 flex justify-between items-center border-b border-border/40">
                                    <div>
                                        <h3 className="font-semibold text-foreground">Membros da Equipe</h3>
                                        <p className="text-xs text-muted-foreground">Lista de usuários com acesso aos dados da clínica.</p>
                                    </div>
                                    <button onClick={() => setIsFuncModalOpen(true)} className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                        <Plus className="w-4 h-4" /> Convidar Membro
                                    </button>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/30 bg-muted/20">
                                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Usuário ID</th>
                                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Perfil de Acesso</th>
                                            <th className="text-left py-3 px-6 text-muted-foreground font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {funcionarios.map(f => (
                                            <tr key={f.id} className="hover:bg-muted/30">
                                                <td className="py-3 px-6"><span className="font-mono text-xs truncate max-w-[150px] inline-block">{f.user_id}</span></td>
                                                <td className="py-3 px-6">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                                        {f.perfil_nome}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <span className="text-xs text-success-foreground bg-success/10 px-2 py-1 rounded-md capitalize">{f.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                    </Tabs>
                )}
            </motion.div>

            {/* Modal - Configuração de Perfil */}
            <CrudModal open={isPerfilModalOpen} onClose={() => setIsPerfilModalOpen(false)} title={editingPerfil ? "Editar Perfil" : "Novo Perfil"} onSubmit={handleSalvarPerfil}>
                <FormField label="Nome do Perfil">
                    <input required value={perfilNome} onChange={e => setPerfilNome(e.target.value)} placeholder="Ex: Recepção, Médico..." className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors" />
                </FormField>
                <FormField label="Descrição Breve">
                    <input value={perfilDescricao} onChange={e => setPerfilDescricao(e.target.value)} placeholder="O que este perfil faz?" className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors" />
                </FormField>

                <div className="mt-8 border-t border-border/50 pt-6">
                    <h4 className="font-semibold text-sm mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Permissões de Módulo</h4>
                    <div className="space-y-3">
                        {MODULOS_SISTEMA.map(mod => {
                            const liberado = permissoesAtuais[mod.id] || false;
                            const Icon = mod.icone;
                            return (
                                <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 transition-colors bg-muted/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${liberado ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{mod.nome}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePermissao(mod.id)}
                                        className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${liberado ? 'bg-success' : 'bg-muted-foreground/30'}`}
                                    >
                                        <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${liberado ? 'left-[26px]' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CrudModal>

            {/* Modal Convidar Funcionario */}
            <CrudModal open={isFuncModalOpen} onClose={() => setIsFuncModalOpen(false)} title="Adicionar Membro" onSubmit={(e) => { e.preventDefault(); toast.info("Na V2: Uma edge function enviará um convite por e-mail para o usuário entrar diretamente neste Tenant."); setIsFuncModalOpen(false); }}>
                <div className="p-4 bg-primary/10 text-primary rounded-xl mb-4 text-sm">
                    <strong>Dica:</strong> Em breve o funcionário receberá um convite de acesso rápido no e-mail informado limitando seus recursos à clínica atual.
                </div>
                <FormField label="Email do Funcionário">
                    <input type="email" required value={novoFuncEmail} onChange={e => setNovoFuncEmail(e.target.value)} className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors" />
                </FormField>
                <FormField label="Perfil (Role)">
                    <FormSelect value={novoFuncPerfil} onChange={e => setNovoFuncPerfil(e.target.value)}>
                        <option value="">Selecione um perfil...</option>
                        {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </FormSelect>
                </FormField>
            </CrudModal>

        </div>
    );
}
