'use client';
import { saveAutomationFlow } from '@/app/actions/automations';
import { toast } from 'sonner';

import React, { useCallback, useRef, useState } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TriggerNode from './nodes/TriggerNode';
import MessageNode from './nodes/MessageNode';
import Sidebar from './Sidebar';

const nodeTypes = {
    trigger: TriggerNode,
    message: MessageNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 250, y: 5 },
        data: { label: 'Início (Comentário)' },
        type: 'trigger',
    },
];

const initialEdges: Edge[] = [];

// Inner component to use `useReactFlow` hook
function FlowBuilderContent({ initialData }: { initialData?: { nodes: Node[], edges: Edge[] } | null }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // Validar e sanitizar dados iniciais para evitar crash
    const validNodes = Array.isArray(initialData?.nodes) && initialData!.nodes.length > 0
        ? initialData!.nodes.filter(n => n && n.position && typeof n.position.x === 'number')
        : initialNodes;

    const validEdges = Array.isArray(initialData?.edges) ? initialData!.edges : initialEdges;

    const [nodes, setNodes, onNodesChange] = useNodesState(validNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(validEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [loading, setLoading] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: label },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onSave = useCallback(async () => {
        setLoading(true);
        try {
            const result = await saveAutomationFlow(nodes, edges);
            if (result.success) {
                toast.success('Fluxo salvo com sucesso!', {
                    description: 'Sua automação foi persistida no banco de dados.',
                    duration: 4000
                });
            } else {
                if (result.error === 'NO_ORG_FOUND') {
                    toast.error('Organização não encontrada', {
                        description: 'Por favor, crie um usuário/perfil no Supabase manualmente ou rode o script de seed.',
                        duration: 10000,
                    });
                } else {
                    toast.error('Erro ao salvar', {
                        description: result.error,
                    });
                }
            }
        } catch (e) {
            toast.error('Erro inesperado', {
                description: 'Ocorreu um erro ao tentar salvar o fluxo.'
            });
        } finally {
            setLoading(false);
        }
    }, [nodes, edges]);

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Automação'}
                    </button>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
            <Sidebar />
        </div>
    );
}

export default function FlowBuilder({ initialData }: { initialData?: { nodes: Node[], edges: Edge[] } | null }) {
    return (
        <ReactFlowProvider>
            <FlowBuilderContent initialData={initialData} />
        </ReactFlowProvider>
    );
}
