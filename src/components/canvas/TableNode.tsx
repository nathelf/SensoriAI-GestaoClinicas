import { Handle, Position, NodeProps } from '@xyflow/react';
import { Activity } from 'lucide-react';

export function TableNode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;
    const procedimentos = (data.topProcedimentos || []) as { nome: string; quantidade: number }[];
    const handleClasses = "w-3 h-3 bg-[#BAE1FF] border-2 border-background shadow-sm hover:w-4 hover:h-4 hover:bg-[#8ACEFF] transition-all";

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[300px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <Handle type="source" position={Position.Top} id="top" className={handleClasses} />
            <Handle type="source" position={Position.Right} id="right" className={handleClasses} />
            <Handle type="source" position={Position.Bottom} id="bottom" className={handleClasses} />
            <Handle type="source" position={Position.Left} id="left" className={handleClasses} />

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
                            <div className="text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded-full border border-border/50">
                                {p.quantidade} agend.
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
