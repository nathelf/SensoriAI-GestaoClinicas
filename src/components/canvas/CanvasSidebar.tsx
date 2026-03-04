import React, { DragEvent } from 'react';
import {
    LayoutDashboard,
    Activity,
    BrainCircuit,
    Users,
    Calendar,
    Stethoscope,
    Package,
    DollarSign,
    FileText,
    Wallet,
    Receipt,
    MessageSquare,
    BarChart3,
    AlertCircle,
    Bot,
    ScanLine,
    ShoppingCart,
    ClipboardList,
    Building2,
    UserPlus,
    Cake,
    ImageIcon,
    Link2,
    Lock,
    CreditCard,
    TrendingUp,
    PieChart,
} from 'lucide-react';

const blockCls = "w-full flex items-center gap-3 p-3 border border-border rounded-xl cursor-grab active:cursor-grabbing group transition-colors";
const iconCls = (hover: string, bg: string, text: string) =>
    `p-2 rounded-lg ${bg} ${text} group-hover:opacity-90`;

export function CanvasSidebar() {
    const onDragStart = (
        event: DragEvent,
        nodeType: string,
        extraData?: { label: string; iconName: string; colorTheme: string }
    ) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (extraData) {
            event.dataTransfer.setData('application/reactflow-data', JSON.stringify(extraData));
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="bg-card p-5 rounded-2xl shadow-sm border border-border/50 h-fit md:col-span-4 lg:col-span-3">
            <h3 className="font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Blocos de Dados</h3>
            <p className="text-xs text-muted-foreground mb-4">Arraste os blocos para a malha e conecte aos pontos coloridos para montar o relatório.</p>

            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                {/* IA - Destaque */}
                <div
                    onDragStart={(e) => onDragStart(e, 'ai')}
                    draggable
                    className={`${blockCls} border-2 border-dashed border-primary/40 hover:bg-primary/5 mb-4 relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className={iconCls('', 'bg-primary/10', 'text-primary')}>
                        <BrainCircuit size={18} />
                    </div>
                    <span className="text-sm font-bold text-primary">Insight Inteligente (IA)</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Métricas do período</h4>
                <div onDragStart={(e) => onDragStart(e, 'metrics')} draggable className={`${blockCls} hover:border-blue-500/50 hover:bg-blue-500/5`}>
                    <div className={iconCls('', 'bg-blue-500/10', 'text-blue-600 dark:text-blue-400')}><LayoutDashboard size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Faturamento Total</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'table')} draggable className={`${blockCls} hover:border-emerald-500/50 hover:bg-emerald-500/5`}>
                    <div className={iconCls('', 'bg-emerald-500/10', 'text-emerald-600 dark:text-emerald-400')}><Activity size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Top Procedimentos</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Visão geral & Dashboard</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Visão Geral', iconName: 'LayoutDashboard', colorTheme: 'bg-indigo-500/10 text-indigo-600' })} draggable className={`${blockCls} hover:border-indigo-500/50 hover:bg-indigo-500/5`}>
                    <div className={iconCls('', 'bg-indigo-500/10', 'text-indigo-600')}><LayoutDashboard size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Visão Geral</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Agenda</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Agenda & Consultas', iconName: 'Calendar', colorTheme: 'bg-orange-500/10 text-orange-600' })} draggable className={`${blockCls} hover:border-orange-500/50 hover:bg-orange-500/5`}>
                    <div className={iconCls('', 'bg-orange-500/10', 'text-orange-600')}><Calendar size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Agenda</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Bloqueios de Horário', iconName: 'Lock', colorTheme: 'bg-orange-600/10 text-orange-700' })} draggable className={`${blockCls} hover:border-orange-600/50 hover:bg-orange-600/5`}>
                    <div className={iconCls('', 'bg-orange-600/10', 'text-orange-700')}><Lock size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Bloqueios</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Links de Agendamento', iconName: 'Link2', colorTheme: 'bg-amber-500/10 text-amber-600' })} draggable className={`${blockCls} hover:border-amber-500/50 hover:bg-amber-500/5`}>
                    <div className={iconCls('', 'bg-amber-500/10', 'text-amber-600')}><Link2 size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Links Agendamento</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Pacientes & Contatos</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Pacientes & Leads', iconName: 'Users', colorTheme: 'bg-violet-500/10 text-violet-600' })} draggable className={`${blockCls} hover:border-violet-500/50 hover:bg-violet-500/5`}>
                    <div className={iconCls('', 'bg-violet-500/10', 'text-violet-600')}><Users size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Pacientes</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Profissionais', iconName: 'UserPlus', colorTheme: 'bg-violet-600/10 text-violet-700' })} draggable className={`${blockCls} hover:border-violet-600/50 hover:bg-violet-600/5`}>
                    <div className={iconCls('', 'bg-violet-600/10', 'text-violet-700')}><UserPlus size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Profissionais</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Fornecedores', iconName: 'Building2', colorTheme: 'bg-slate-500/10 text-slate-600' })} draggable className={`${blockCls} hover:border-slate-500/50 hover:bg-slate-500/5`}>
                    <div className={iconCls('', 'bg-slate-500/10', 'text-slate-600')}><Building2 size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Fornecedores</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Aniversariantes', iconName: 'Cake', colorTheme: 'bg-pink-500/10 text-pink-600' })} draggable className={`${blockCls} hover:border-pink-500/50 hover:bg-pink-500/5`}>
                    <div className={iconCls('', 'bg-pink-500/10', 'text-pink-600')}><Cake size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Aniversariantes</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Atendimento & Prontuário</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Atendimento Clínico', iconName: 'Stethoscope', colorTheme: 'bg-rose-500/10 text-rose-600' })} draggable className={`${blockCls} hover:border-rose-500/50 hover:bg-rose-500/5`}>
                    <div className={iconCls('', 'bg-rose-500/10', 'text-rose-600')}><Stethoscope size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Prontuário</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Histórico de Procedimentos', iconName: 'ClipboardList', colorTheme: 'bg-rose-600/10 text-rose-700' })} draggable className={`${blockCls} hover:border-rose-600/50 hover:bg-rose-600/5`}>
                    <div className={iconCls('', 'bg-rose-600/10', 'text-rose-700')}><ClipboardList size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Histórico</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Galeria de Evolução', iconName: 'ImageIcon', colorTheme: 'bg-fuchsia-500/10 text-fuchsia-600' })} draggable className={`${blockCls} hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5`}>
                    <div className={iconCls('', 'bg-fuchsia-500/10', 'text-fuchsia-600')}><ImageIcon size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Galeria Evolução</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Alertas de Retorno', iconName: 'AlertCircle', colorTheme: 'bg-red-500/10 text-red-600' })} draggable className={`${blockCls} hover:border-red-500/50 hover:bg-red-500/5`}>
                    <div className={iconCls('', 'bg-red-500/10', 'text-red-600')}><AlertCircle size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Alertas Retorno</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Financeiro</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Visão Financeira', iconName: 'Wallet', colorTheme: 'bg-green-500/10 text-green-600' })} draggable className={`${blockCls} hover:border-green-500/50 hover:bg-green-500/5`}>
                    <div className={iconCls('', 'bg-green-500/10', 'text-green-600')}><Wallet size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Financeiro</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Contas a Receber', iconName: 'TrendingUp', colorTheme: 'bg-green-600/10 text-green-700' })} draggable className={`${blockCls} hover:border-green-600/50 hover:bg-green-600/5`}>
                    <div className={iconCls('', 'bg-green-600/10', 'text-green-700')}><TrendingUp size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Contas a Receber</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Contas a Pagar', iconName: 'Receipt', colorTheme: 'bg-teal-500/10 text-teal-600' })} draggable className={`${blockCls} hover:border-teal-500/50 hover:bg-teal-500/5`}>
                    <div className={iconCls('', 'bg-teal-500/10', 'text-teal-600')}><Receipt size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Contas a Pagar</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Fluxo de Caixa', iconName: 'BarChart3', colorTheme: 'bg-emerald-600/10 text-emerald-700' })} draggable className={`${blockCls} hover:border-emerald-600/50 hover:bg-emerald-600/5`}>
                    <div className={iconCls('', 'bg-emerald-600/10', 'text-emerald-700')}><BarChart3 size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Fluxo de Caixa</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Métodos de Pagamento', iconName: 'CreditCard', colorTheme: 'bg-sky-500/10 text-sky-600' })} draggable className={`${blockCls} hover:border-sky-500/50 hover:bg-sky-500/5`}>
                    <div className={iconCls('', 'bg-sky-500/10', 'text-sky-600')}><CreditCard size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Métodos Pagamento</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Vendas & Comissões</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Vendas & Pacotes', iconName: 'ShoppingCart', colorTheme: 'bg-lime-500/10 text-lime-600' })} draggable className={`${blockCls} hover:border-lime-500/50 hover:bg-lime-500/5`}>
                    <div className={iconCls('', 'bg-lime-500/10', 'text-lime-600')}><ShoppingCart size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Vendas</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Comissões', iconName: 'DollarSign', colorTheme: 'bg-amber-500/10 text-amber-600' })} draggable className={`${blockCls} hover:border-amber-500/50 hover:bg-amber-500/5`}>
                    <div className={iconCls('', 'bg-amber-500/10', 'text-amber-600')}><DollarSign size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Comissões</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Relatório de Comissões', iconName: 'PieChart', colorTheme: 'bg-amber-600/10 text-amber-700' })} draggable className={`${blockCls} hover:border-amber-600/50 hover:bg-amber-600/5`}>
                    <div className={iconCls('', 'bg-amber-600/10', 'text-amber-700')}><PieChart size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Rel. Comissões</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Estoque & Documentos</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Estoque & Produtos', iconName: 'Package', colorTheme: 'bg-cyan-500/10 text-cyan-600' })} draggable className={`${blockCls} hover:border-cyan-500/50 hover:bg-cyan-500/5`}>
                    <div className={iconCls('', 'bg-cyan-500/10', 'text-cyan-600')}><Package size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Estoque</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Documentos e Termos', iconName: 'FileText', colorTheme: 'bg-blue-600/10 text-blue-700' })} draggable className={`${blockCls} hover:border-blue-600/50 hover:bg-blue-600/5`}>
                    <div className={iconCls('', 'bg-blue-600/10', 'text-blue-700')}><FileText size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Documentos</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Comunicação', iconName: 'MessageSquare', colorTheme: 'bg-sky-600/10 text-sky-700' })} draggable className={`${blockCls} hover:border-sky-600/50 hover:bg-sky-600/5`}>
                    <div className={iconCls('', 'bg-sky-600/10', 'text-sky-700')}><MessageSquare size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Comunicação</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">IA & Sensori</h4>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Assistente de Vendas', iconName: 'Bot', colorTheme: 'bg-primary/10 text-primary' })} draggable className={`${blockCls} hover:border-primary/50 hover:bg-primary/5`}>
                    <div className={iconCls('', 'bg-primary/10', 'text-primary')}><Bot size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Chat IA</span>
                </div>
                <div onDragStart={(e) => onDragStart(e, 'generic', { label: 'Análise Facial IA', iconName: 'ScanLine', colorTheme: 'bg-purple-500/10 text-purple-600' })} draggable className={`${blockCls} hover:border-purple-500/50 hover:bg-purple-500/5`}>
                    <div className={iconCls('', 'bg-purple-500/10', 'text-purple-600')}><ScanLine size={18} /></div>
                    <span className="text-sm font-medium text-foreground">Análise Facial</span>
                </div>
            </div>
        </aside>
    );
}
