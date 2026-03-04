import { Handle, Position, NodeProps } from '@xyflow/react';
import { LayoutDashboard } from 'lucide-react';

export function MetricsNode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;
    const handleClasses = "w-3 h-3 bg-[#CDB4DB] border-2 border-background shadow-sm hover:w-4 hover:h-4 hover:bg-[#E6B3FF] transition-all";

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[250px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <Handle type="source" position={Position.Top} id="top" className={handleClasses} />
            <Handle type="source" position={Position.Right} id="right" className={handleClasses} />
            <Handle type="source" position={Position.Bottom} id="bottom" className={handleClasses} />
            <Handle type="source" position={Position.Left} id="left" className={handleClasses} />

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <LayoutDashboard size={18} />
                </div>
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Faturamento Total</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
                {data.loading ? (
                    <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                ) : (
                    <h2 className="text-3xl font-black text-foreground tracking-tight">
                        <span className="text-muted-foreground text-xl mr-1 font-medium">R$</span>
                        {Number(data.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                )}
            </div>
        </div>
    );
}
