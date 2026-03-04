import { NodeProps } from '@xyflow/react';
import { BrainCircuit, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeHandle } from './NodeHandle';

export function AINode({ data }: NodeProps) {
    const isPdfMode = !!data.isPdfMode;
    const isConnected = !!data.isConnected;
    const isGenerating = !!data.isGenerating;
    const content = data.content as string;

    return (
        <div className={`bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 rounded-2xl border ${isConnected ? 'border-primary/50 shadow-md ring-2 ring-primary/20' : 'border-primary/20'} min-w-[350px] max-w-[400px] relative ${isPdfMode ? '' : 'transition-all'}`}>

            {/* Handles nos 4 lados: área grande para a linha grudar na bolinha */}
            <NodeHandle position="top" />
            <NodeHandle position="right" />
            <NodeHandle position="bottom" />
            <NodeHandle position="left" />

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
