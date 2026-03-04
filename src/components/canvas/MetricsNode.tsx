import { NodeProps } from '@xyflow/react';
import { LayoutDashboard } from 'lucide-react';
import { NodeHandle } from './NodeHandle';

export function MetricsNode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[250px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <NodeHandle position="top" />
            <NodeHandle position="right" />
            <NodeHandle position="bottom" />
            <NodeHandle position="left" />

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
