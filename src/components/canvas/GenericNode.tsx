import { Handle, Position, NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import React from 'react';

export function GenericNode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;

    // Icon resolution
    const IconName = (data.iconName as string) || 'FileText';
    // @ts-ignore
    const IconComponent = Icons[IconName] || Icons.FileText;

    const colorCls = (data.colorTheme as string) || 'bg-slate-500/10 text-slate-600';
    const handleClasses = "w-3 h-3 bg-[#fdfd96] border-2 border-background shadow-sm hover:w-4 hover:h-4 hover:bg-[#fffacd] transition-all";

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[250px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <Handle type="source" position={Position.Top} id="top" className={handleClasses} />
            <Handle type="source" position={Position.Right} id="right" className={handleClasses} />
            <Handle type="source" position={Position.Bottom} id="bottom" className={handleClasses} />
            <Handle type="source" position={Position.Left} id="left" className={handleClasses} />

            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorCls}`}>
                    <IconComponent size={18} />
                </div>
                <span className="text-sm font-semibold text-foreground uppercase tracking-wider">{data.label as string}</span>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
                Dados consolidados prontos para correlação inteligente na IA.
            </div>
        </div>
    );
}
