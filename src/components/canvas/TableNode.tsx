import { NodeProps } from '@xyflow/react';
import { Activity } from 'lucide-react';
import { NodeHandle } from './NodeHandle';
import { NodeDeleteButton } from './NodeDeleteButton';

export function TableNode({ id, data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;
    const procedimentos = (data.topProcedimentos || []) as { nome: string; quantidade: number; crescimento?: string; valor_total?: number }[];

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[300px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <NodeDeleteButton nodeId={id} hidden={isPdfMode} />
            <NodeHandle position="top" />
            <NodeHandle position="right" />
            <NodeHandle position="bottom" />
            <NodeHandle position="left" />

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Activity size={18} />
                </div>
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Top Procedimentos</span>
            </div>

            <div className="flex flex-col gap-3 py-2">
                {data.loading ? (
                    <>
                        <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
                        <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
                    </>
                ) : procedimentos.length > 0 ? (
                    procedimentos.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">#{idx + 1}</div>
                                <span className="font-medium text-foreground text-sm">{p.nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {p.crescimento && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${String(p.crescimento).startsWith('+') ? 'bg-success/20 text-success' : String(p.crescimento).startsWith('-') ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                        {p.crescimento}
                                    </span>
                                )}
                                {p.valor_total != null && p.valor_total > 0 && (
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.valor_total)}
                                    </span>
                                )}
                                <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded-full border border-border/50">
                                    {p.quantidade} agend.
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">Nenhum dado no período.</p>
                )}
            </div>
        </div>
    );
}
