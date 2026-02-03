import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MessageNode({ data }: { data: { label: string } }) {
    return (
        <Card className="min-w-[200px] border-blue-500 border-2">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
            <CardHeader className="p-3 bg-blue-50 rounded-t-sm">
                <CardTitle className="text-sm font-bold text-blue-700">Mensagem Direct</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                <div className="text-sm text-gray-700">{data.label}</div>
            </CardContent>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
        </Card>
    );
}
