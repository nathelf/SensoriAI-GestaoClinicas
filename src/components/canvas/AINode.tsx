import { Handle, Position, NodeProps } from '@xyflow/react';
import { BrainCircuit, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AINode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;
    const isConnected = !!data.isConnected;
    const isGenerating = !!data.isGenerating;
    const content = data.content as string;

    const handleClasses = `w-4 h-4 rounded-full border-2 border-background shadow-sm transition-all hover:scale-125 ${isConnected ? 'bg-[#E6B3FF]' : 'bg-[#FFC8DD] animate-pulse'}`;

    return (
        <div className={`bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 rounded-2xl border ${isConnected ? 'border-primary/50 shadow-md ring-2 ring-primary/20' : 'border-primary/20'} min-w-[350px] max-w-[400px] relative ${isPdfMode ? '' : 'transition-all'}`}>

            {/* Target Handles - 4 lados da IA */}
            <Handle type="target" position={Position.Top} id="top" className={handleClasses} />
            <Handle type="target" position={Position.Right} id="right" className={handleClasses} />
            <Handle type="target" position={Position.Bottom} id="bottom" className={handleClasses} />
            <Handle type="target" position={Position.Left} id="left" className={handleClasses} />

            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-border/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm flex items-center gap-1">
                <Sparkles size={10} /> SensoriAI Verified
            </div>

            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shadow-md transition-colors ${isConnected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <BrainCircuit size={24} />
                </div>
                <div className="flex-1 pt-1">
                    {content ? (
                        <p className="text-foreground leading-relaxed text-sm">{content}</p>
                    ) : (
                        <p className="text-muted-foreground italic text-sm">
                            {isConnected
                                ? "Conectado. Clique abaixo para gerar o insight."
                                : "Conecte os dados arrastando para qualquer uma das bolinhas coloridas."}
                        </p>
                    )}

                    {!isPdfMode && (
                        <Button
                            onClick={() => {
                                if (typeof data.onGenerate === 'function') {
                                    data.onGenerate();
                                }
                            }}
                            disabled={!isConnected || isGenerating || Boolean(data.loading)}
                            variant={isConnected ? "default" : "secondary"}
                            size="sm"
                            className="mt-5 text-xs font-bold transition-all shadow-sm w-full"
                        >
                            {isGenerating ? (
                                <><Activity size={14} className="mr-2 animate-pulse" /> Analisando Dados...</>
                            ) : (
                                <><Sparkles size={14} className="mr-2" /> {content ? 'Recalcular Insights' : 'Gerar Consultoria IA'}</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
