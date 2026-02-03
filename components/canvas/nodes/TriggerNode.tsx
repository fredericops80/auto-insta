import { Handle, Position } from '@xyflow/react';

export default function TriggerNode({ data }: { data: { label: string } }) {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[200px]">
            <div className="font-bold text-xs text-green-700 mb-2">GATILHO (EDITÁVEL)</div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">Palavra-chave:</label>
                <input
                    className="border rounded p-1 text-sm w-full font-bold text-gray-800"
                    defaultValue={data.label}
                    onChange={(evt) => data.label = evt.target.value}
                    placeholder="Ex: quero"
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
        </div>
    );
}
