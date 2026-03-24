import { useState, useRef, useCallback, DragEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Sparkles, Calendar as CalendarIcon, Loader2, Save, FileStack } from 'lucide-react';
import { useFaturamento, DateRange } from '../hooks/useFaturamento';
import { useReportConfig } from '../hooks/useReportConfig';
import { useReportTemplates } from '../hooks/useReportTemplates';
import { usePatientHistory } from '../hooks/usePatientHistory';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
    OnReconnect,
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
import { ReportConfigModal } from '@/components/canvas/ReportConfigModal';
import { PatientSearchBlock } from '@/components/canvas/PatientSearchBlock';
import { PASTEL_PALETTE } from '@/components/canvas/canvasStyles';
import { getReportContext } from '@/lib/reportContext';
import { buildReportData } from '@/lib/buildReportData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button as DialogButton } from '@/components/ui/button';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
let idCounter = 0;
const getId = () => `node_${idCounter++} `;

const nodeTypes = {
    metrics: MetricsNode,
    table: TableNode,
    ai: AINode,
    generic: GenericNode,
    patientSelector: PatientSearchBlock,
};

function RelatoriosPersonalizadosContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 30),
        to: new Date()
    });

    const { profile } = useAuth();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const patientId = nodes.find((n) => n.type === 'patientSelector')?.data?.selectedId as string | undefined;
    const patientHistorico = usePatientHistory(patientId);
    const { total, topProcedimentos, loading } = useFaturamento(dateRange, patientId);
    const { config: reportConfig, setConfig: setReportConfig } = useReportConfig();
    const { saveTemplate } = useReportTemplates();
    const [isExporting, setIsExporting] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    nodesRef.current = nodes;
    edgesRef.current = edges;
    const { screenToFlowPosition } = useReactFlow();

    // Carregar template da navegação (vindo de /relatorios/templates)
    useEffect(() => {
        const state = location.state as { loadTemplate?: { nodes: Node[]; edges: Edge[] } } | null;
        if (state?.loadTemplate?.nodes?.length) {
            const { nodes: loadedNodes, edges: loadedEdges } = state.loadTemplate;
            const rehydrated = loadedNodes.map((n) => {
                const base = { ...n, data: { ...n.data } };
                if (n.type === 'ai') {
                    (base.data as Record<string, unknown>).onGenerate = () => handleGenerateAISummary(n.id);
                    (base.data as Record<string, unknown>).loading = false;
                    (base.data as Record<string, unknown>).isPdfMode = false;
                }
                if (n.type === 'patientSelector') {
                    (base.data as Record<string, unknown>).onPatientSelect = (patient: unknown) => {
                        setNodes((nds) =>
                            nds.map((no) =>
                                no.id === n.id
                                    ? { ...no, data: { ...no.data, selectedPatient: patient, selectedId: (patient as { id?: string })?.id, patientId: (patient as { id?: string })?.id } }
                                    : no
                            )
                        );
                    };
                }
                if (n.type === 'metrics') (base.data as Record<string, unknown>).total = total;
                if (n.type === 'table') (base.data as Record<string, unknown>).topProcedimentos = topProcedimentos;
                return base;
            });
            setNodes(rehydrated);
            setEdges(loadedEdges);
            const templateConfig = (state as { templateConfig?: { logoUrl?: string; titulo?: string; rodape?: string } }).templateConfig;
            if (templateConfig) {
                setReportConfig((prev) => ({
                    ...prev,
                    ...(templateConfig.titulo && { titulo: templateConfig.titulo }),
                    ...(templateConfig.rodape && { rodape: templateConfig.rodape }),
                    ...(templateConfig.logoUrl && { logoDataUrl: templateConfig.logoUrl }),
                }));
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, total, topProcedimentos, setReportConfig]);

    // Handlers do React Flow
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onReconnect: OnReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        setEdges((eds) => {
            const rest = eds.filter((e) => e.id !== oldEdge.id);
            const index = rest.length % PASTEL_PALETTE.length;
            return [
                ...rest,
                {
                    ...newConnection,
                    id: oldEdge.id,
                    animated: true,
                    style: { stroke: PASTEL_PALETTE[index], strokeWidth: 5 },
                },
            ];
        });
        if (newConnection.target) {
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === newConnection.target && n.type === 'ai'
                        ? { ...n, data: { ...n.data, isConnected: true } }
                        : n
                )
            );
        }
    }, []);

    // Sincroniza isConnected dos nós de IA quando edges mudam
    useEffect(() => {
        const aiNodeIds = nodes.filter((n) => n.type === 'ai').map((n) => n.id);
        const connectedToAi = new Set(edges.filter((e) => aiNodeIds.includes(e.target)).map((e) => e.target));
        setNodes((nds) =>
            nds.map((n) => {
                if (n.type === 'ai') {
                    return { ...n, data: { ...n.data, isConnected: connectedToAi.has(n.id) } };
                }
                return n;
            })
        );
    }, [edges]);

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
        setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: true } } : n));

        const periodo = dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
            : new Date().toLocaleDateString('pt-BR');
        const context = getReportContext(nodesRef.current, edgesRef.current, {
            clinica: profile?.clinic_name || 'Clínica SensoriAI',
            periodo,
        });

        if (!context || Object.keys(context.dados).length === 0) {
            setNodes((nds) => nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false, content: 'Conecte ao menos um bloco de métrica à IA para gerar o insight.' } } : n
            ));
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('gerar-insight-relatorio', {
                body: { metadata: context.metadata, dados: context.dados }
            });
            if (error) throw error;

            setNodes((nds) => nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false, content: data.insight } } : n
            ));
        } catch (error) {
            console.error('Erro na IA:', error);
            setNodes((nds) => nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, isGenerating: false, content: 'Erro de conexão com a IA.' } } : n
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

            const baseData: Record<string, unknown> = {
                loading: type !== 'ai' && type !== 'patientSelector' ? loading : false,
                total: type === 'metrics' ? total : undefined,
                topProcedimentos: type === 'table' ? topProcedimentos : undefined,
                isConnected: false,
                isGenerating: false,
                content: '',
                onGenerate: () => handleGenerateAISummary(newNodeId),
                isPdfMode: false,
                ...extraData,
            };
            if (type === 'patientSelector') {
                baseData.onPatientSelect = (patient: { id: string; name: string; email?: string; cpf?: string; birth_date?: string } | null) => {
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === newNodeId
                                ? { ...n, data: { ...n.data, selectedPatient: patient, selectedId: patient?.id, patientId: patient?.id } }
                                : n
                        )
                    );
                };
            }

            const newNode: Node = { id: newNodeId, type, position, data: baseData };
            setNodes((nds) => nds.concat(newNode));
        },
        [total, topProcedimentos, loading, screenToFlowPosition]
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
        setIsPrinting(true);
        setIsExporting(true);

        try {
            const medicalData = buildReportData(nodesRef.current, { patientHistorico });
            const periodo =
                dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                    : new Date().toLocaleDateString('pt-BR');
            const clinica = profile?.clinic_name || 'Clínica SensoriAI';

            const [{ pdf }, { MedicalReportTemplate }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('@/components/pdf/MedicalReportTemplate'),
            ]);

            const blob = await pdf(
                <MedicalReportTemplate
                    data={medicalData}
                    clinicConfig={reportConfig}
                    periodo={periodo}
                    clinica={clinica}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Relatorio_${(reportConfig.titulo || 'Performance').replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            setIsPrinting(false);
            setIsExporting(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-muted/20 flex flex-col h-screen">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 bg-card p-5 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

                {isPrinting ? (
                    <div className="flex justify-between items-center w-full animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-3xl font-extrabold text-foreground leading-tight">SensoriAI</h2>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Inteligência em Gestão de Clínicas</p>
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

                            <ReportConfigModal config={reportConfig} setConfig={setReportConfig} />

                            <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
                                <DialogTrigger asChild>
                                    <DialogButton variant="outline" className="gap-2" disabled={nodes.length === 0}>
                                        <Save size={16} />
                                        Salvar como Modelo
                                    </DialogButton>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Salvar modelo de relatório</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div>
                                            <Label htmlFor="templateName">Nome do modelo</Label>
                                            <Input
                                                id="templateName"
                                                placeholder="Ex: Relatório Mensal Clínica"
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>
                                        <DialogButton
                                            onClick={async () => {
                                                if (!templateName.trim()) return;
                                                await saveTemplate(templateName.trim(), nodes, edges, {
                                                config: {
                                                    logoUrl: reportConfig.logoDataUrl,
                                                    titulo: reportConfig.titulo,
                                                    rodape: reportConfig.rodape,
                                                },
                                            });
                                                setTemplateName('');
                                                setSaveModalOpen(false);
                                            }}
                                            disabled={!templateName.trim()}
                                            className="gap-2"
                                        >
                                            <Save size={16} />
                                            Salvar
                                        </DialogButton>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button
                                variant="ghost"
                                size="icon"
                                title="Ver modelos salvos"
                                onClick={() => navigate('/relatorios/templates')}
                            >
                                <FileStack size={18} />
                            </Button>

                            <Button onClick={exportPDF} disabled={isExporting} variant="default" className="gap-2 shadow-sm">
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {isExporting ? 'Gerando...' : 'Gerar Relatório PDF'}
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
                        onReconnect={onReconnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        connectionRadius={50}
                        deleteKeyCode={['Backspace', 'Delete']}
                        defaultEdgeOptions={{ reconnectable: true }}
                        nodesDraggable
                        nodesConnectable
                        elementsSelectable
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
