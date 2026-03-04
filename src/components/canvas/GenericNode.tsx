import { NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import React from 'react';
import { NodeHandle } from './NodeHandle';
import { NodeDeleteButton } from './NodeDeleteButton';

export function GenericNode({ id, data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;

    const IconName = (data.iconName as string) || 'FileText';
    // @ts-ignore
    const IconComponent = Icons[IconName] || Icons.FileText;

    const colorCls = (data.colorTheme as string) || 'bg-slate-500/10 text-slate-600';

    return (
        <div className={`bg-card border border-border/60 rounded-2xl shadow-sm min-w-[250px] p-6 relative ${isPdfMode ? '' : 'hover:shadow-md transition-shadow'}`}>
            <NodeDeleteButton nodeId={id} hidden={isPdfMode} />
            <NodeHandle position="top" />
            <NodeHandle position="right" />
            <NodeHandle position="bottom" />
            <NodeHandle position="left" />

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
