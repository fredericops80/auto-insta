import FlowBuilder from '@/components/canvas/FlowBuilder';
import ConnectionStatus from '@/components/ConnectionStatus';
import { getAutomationFlow } from '@/app/actions/automations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    const initialData = await getAutomationFlow();

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">Nova Automação</h1>
                <ConnectionStatus />
            </div>
            <p className="mb-6 text-gray-600">Construa seu fluxo de automação visualmente. Arraste os nós para o canvas.</p>

            <div className="bg-white rounded-lg shadow flex-1 border min-h-[500px]">
                <FlowBuilder initialData={initialData} />
            </div>
        </div>
    );
}
