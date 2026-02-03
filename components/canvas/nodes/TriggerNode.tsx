import { Handle, Position } from '@xyflow/react';

export default function TriggerNode({ data }: { data: { label: string } }) {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500">
            <div className="font-bold text-sm text-green-700">GATILHO</div>
            <div className="font-bold">{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
        </div>
    );
}
