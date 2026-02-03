import React from 'react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-l p-4 flex flex-col gap-4 overflow-y-auto">
            <h3 className="font-bold text-gray-700 mb-2">Adicionar Nós</h3>

            <div className="text-xs text-gray-500 mb-4">
                Arraste os itens abaixo para o canvas.
            </div>

            <div
                className="p-3 border-2 border-green-500 rounded cursor-grab bg-green-50 hover:shadow-md transition-all"
                onDragStart={(event) => onDragStart(event, 'trigger', 'Novo Gatilho')}
                draggable
            >
                <div className="font-bold text-green-700 text-sm">Gatilho</div>
                <div className="text-xs text-gray-600">Comentário/Story</div>
            </div>

            <div
                className="p-3 border-2 border-blue-500 rounded cursor-grab bg-blue-50 hover:shadow-md transition-all"
                onDragStart={(event) => onDragStart(event, 'message', 'Sua Mensagem Aqui')}
                draggable
            >
                <div className="font-bold text-blue-700 text-sm">Mensagem Direct</div>
                <div className="text-xs text-gray-600">Enviar texto/mídia</div>
            </div>

            {/* Future Nodes */}
            <div className="opacity-50 p-3 border border-gray-300 rounded bg-gray-50 cursor-not-allowed">
                <div className="font-bold text-gray-500 text-sm">Condição (Em breve)</div>
            </div>
        </aside>
    );
}
