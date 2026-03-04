import { useState, useRef, useCallback, DragEvent, useEffect } from 'react';
import { Download, Sparkles, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useFaturamento, DateRange } from '../hooks/useFaturamento';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    BackgroundVariant,
    Connection,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Importando nossos componentes customizados
import { MetricsNode } from '@/components/canvas/MetricsNode';
import { TableNode } from '@/components/canvas/TableNode';
import { AINode } from '@/components/canvas/AINode';
import { GenericNode } from '@/components/canvas/GenericNode';
import { CanvasSidebar } from '@/components/canvas/CanvasSidebar';
import { PASTEL_PALETTE } from '@/components/canvas/canvasStyles';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
let idCounter = 0;
const getId = () => `node_${idCounter++} `;

const nodeTypes = {
    metrics: MetricsNode,
    table: TableNode,
    ai: AINode,
    generic: GenericNode,
};

function RelatoriosPersonalizadosContent() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 30),
        to: new Date()
    });

    const { total, topProcedimentos, resumoParaIA, loading } = useFaturamento(dateRange);
    const [isExporting, setIsExporting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Estados do Flow
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const { screenToFlowPosition } = useReactFlow();

    // Handlers do React Flow
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection | Edge) => {
            setEdges((eds) => {
                // Cada nova conexão recebe a próxima cor da paleta pastel (variando por bloco)
                const index = eds.length % PASTEL_PALETTE.length;
                const strokeColor = PASTEL_PALETTE[index];

                const animatedEdge = {
                    ...params,
                    animated: true,
                    style: { stroke: strokeColor, strokeWidth: 5 },
                };
                return addEdge(animatedEdge, eds);
            });

            // Se conectou ao nó de IA (target), atualizar o estado desse nó para habilitar o botão
            if (params.target) {
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === params.target && node.type === 'ai') {
                            return { ...node, data: { ...node.data, isConnected: true } };
                        }
                        return node;
                    })
                );
            }
        },
        []
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleGenerateAISummary = async (nodeId: string) => {
        // 1. Marca que está carregando na interface do Nó
        setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: true } } : n));

        try {
            const { data, error } = await supabase.functions.invoke('gerar-insight-relatorio', {
                body: { dadosBrutos: resumoParaIA }
            });
            if (error) throw error;

            // 2. Insere a resposta e desliga o loading
            setNodes((nds) => nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false, content: data.insight } } : n
            ));
        } catch (error) {
            console.error("Erro na IA:", error);
            setNodes((nds) => nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false, content: "Erro de conexão com a IA." } } : n
            ));
        }
    };

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!reactFlowWrapper.current) return;

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) return;

            const extraDataStr = event.dataTransfer.getData('application/reactflow-data');
            let extraData = {};
            if (extraDataStr) {
                try {
                    extraData = JSON.parse(extraDataStr);
                } catch (e) { console.error("Could not parse extra data"); }
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNodeId = getId();

            const newNode: Node = {
                id: newNodeId,
                type,
                position,
                data: {
                    loading: type !== 'ai' ? loading : false,
                    total: type === 'metrics' ? total : undefined,
                    topProcedimentos: type === 'table' ? topProcedimentos : undefined,
                    // Propriedades do AINode
                    isConnected: false,
                    isGenerating: false,
                    content: '',
                    onGenerate: () => handleGenerateAISummary(newNodeId),
                    isPdfMode: false,
                    ...extraData
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [total, topProcedimentos, loading, resumoParaIA, screenToFlowPosition]
    );

    // Efeito para repassar mudanças dos dados live (ex: total via realtime) p/ os Nós existentes
    useEffect(() => {
        setNodes((nds) => nds.map((n) => {
            if (n.type === 'metrics') return { ...n, data: { ...n.data, loading, total } };
            if (n.type === 'table') return { ...n, data: { ...n.data, loading, topProcedimentos } };
            return n;
        }));
    }, [total, topProcedimentos, loading]);


    const exportPDF = async () => {
        if (!reactFlowWrapper.current) return;
        setIsPrinting(true);
        setIsExporting(true);

        // Força atualização visual dos nós parar esconder botões
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isPdfMode: true } })));

        // Um pequeno timeout para renderizar as alterações visuais de Header e Nós
        setTimeout(async () => {
            try {
                const flowElement = reactFlowWrapper.current?.querySelector('.react-flow__pane') as HTMLElement || reactFlowWrapper.current;
                const canvas = await html2canvas(flowElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Relatorio_Canvas_SensoriAI_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
            } catch (error) {
                console.error("Erro renderPDF:", error);
            } finally {
                setIsPrinting(false);
                setIsExporting(false);
                setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isPdfMode: false } })));
            }
        }, 250);
    };

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-muted/20 flex flex-col h-screen">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 bg-card p-5 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

                {isPrinting ? (
                    <div className="flex justify-between items-center w-full animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-extrabold text-foreground leading-tight">SensoriAI</h2>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Inteligência em Gestão Estética</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter">Emissão do Relatório</p>
                            <p className="text-foreground font-mono text-lg">{new Date().toLocaleDateString('pt-BR')}</p>
                            <p className="text-primary text-[10px] font-bold">Relatório Autenticado via IA</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-primary" /> Relatórios Dinâmicos
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Ligue os blocos de dados à IA nativa para gerar insights instantâneos.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal bg-background")}>
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {dateRange?.from ? (
                                            dateRange.to ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}` : format(dateRange.from, "dd/MM/yyyy")
                                        ) : <span>Selecione um período</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-border shadow-lg" align="end">
                                    <Calendar
                                        initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange}
                                        onSelect={(range: any) => range?.from && setDateRange({ from: range.from, to: range.to || range.from })}
                                        numberOfMonths={2} locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button onClick={exportPDF} disabled={isExporting} variant="default" className="gap-2 shadow-sm">
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {isExporting ? 'Gerando...' : 'Exportar Canvas'}
                            </Button>
                        </div>
                    </>
                )}
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                <CanvasSidebar />

                <div className="flex-1 bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-card/30"
                    >
                        <Background variant={BackgroundVariant.Dots} gap={16} size={2} color="var(--primary)" className="opacity-20" />
                        <Controls className="!bg-card !border-border fill-foreground shadow-md" />
                    </ReactFlow>

                    {nodes.length === 0 && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground">
                            <p className="font-medium bg-background/80 px-4 py-2 rounded-full border border-border/50 text-sm shadow-sm backdrop-blur">
                                Arraste os blocos do menu lateral para começar e ligue-os à IA.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RelatoriosPersonalizados() {
    return (
        <ReactFlowProvider>
            <RelatoriosPersonalizadosContent />
        </ReactFlowProvider>
    );
}
