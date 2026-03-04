import React, { DragEvent } from 'react';
import { LayoutDashboard, Activity, BrainCircuit, Users, Calendar, Stethoscope, Package, DollarSign } from 'lucide-react';

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
            <p className="text-xs text-muted-foreground mb-4">Arraste os módulos para a malha quadriculada.</p>

            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {/* IA Node - Destaque */}
                <div
                    onDragStart={(event) => onDragStart(event, 'ai')}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-primary/40 rounded-xl hover:bg-primary/5 transition-colors cursor-grab active:cursor-grabbing group relative overflow-hidden mb-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <BrainCircuit size={18} />
                    </div>
                    <span className="text-sm font-bold text-primary">Insight Inteligente (IA)</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Métricas Principais</h4>

                <div
                    onDragStart={(event) => onDragStart(event, 'metrics')}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <LayoutDashboard size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Faturamento Total</span>
                </div>

                <div
                    onDragStart={(event) => onDragStart(event, 'table')}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Activity size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Top Procedimentos</span>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-2 border-t border-border/50">Módulos do Sistema</h4>

                {/* Generic Nodes */}
                <div
                    onDragStart={(event) => onDragStart(event, 'generic', { label: 'Agenda & Consultas', iconName: 'Calendar', colorTheme: 'bg-orange-500/10 text-orange-600' })}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                        <Calendar size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Agenda</span>
                </div>

                <div
                    onDragStart={(event) => onDragStart(event, 'generic', { label: 'Pacientes & Leads', iconName: 'Users', colorTheme: 'bg-violet-500/10 text-violet-600' })}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                        <Users size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Pacientes</span>
                </div>

                <div
                    onDragStart={(event) => onDragStart(event, 'generic', { label: 'Atendimento Clínico', iconName: 'Stethoscope', colorTheme: 'bg-rose-500/10 text-rose-600' })}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-rose-500/50 hover:bg-rose-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                        <Stethoscope size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Prontuário</span>
                </div>

                <div
                    onDragStart={(event) => onDragStart(event, 'generic', { label: 'Comissões', iconName: 'DollarSign', colorTheme: 'bg-amber-500/10 text-amber-600' })}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                        <DollarSign size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Comissões</span>
                </div>

                <div
                    onDragStart={(event) => onDragStart(event, 'generic', { label: 'Estoque & Produtos', iconName: 'Package', colorTheme: 'bg-cyan-500/10 text-cyan-600' })}
                    draggable
                    className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors cursor-grab active:cursor-grabbing group"
                >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
                        <Package size={18} />
                    </div>
                    <span className="text-sm font-medium text-foreground">Estoque</span>
                </div>

            </div>
        </aside>
    );
}
