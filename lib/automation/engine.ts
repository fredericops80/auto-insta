import { createAdminClient } from '@/lib/supabase/server';
import { sendInstagramDM } from '@/lib/instagram/client';

// Types derived from React Flow but simplified for backend execution
type FlowNode = {
    id: string;
    type: string;
    data: { label: string;[key: string]: any };
};

type FlowEdge = {
    source: string;
    target: string;
};

export async function processWebhookEvent(event: any) {
    const supabase = await createAdminClient();
    console.log('⚡ [ENGINE] Processing Event:', event);

    // 1. Extract Trigger Info (Simplified for MVP: Comment Text)
    // Instagram Graph API structure for comments: entry[0].changes[0].value.text
    // Or for mentions: entry[0].messaging[0].message.text
    // We will handle a generic "text" input for now.

    let triggerText = '';
    let instagramUserId = '';
    let triggerCommentId = ''; // New: Capture Comment ID for Private Replies

    // Handle Comment Change
    if (event.value && event.value.text) {
        triggerText = event.value.text;
        instagramUserId = event.value.from.id;
        triggerCommentId = event.value.id; // Correct ID field for comments
    }
    // Handle DM/Mention
    else if (event.message && event.message.text) {
        triggerText = event.message.text;
        instagramUserId = event.sender.id;
    }

    if (!triggerText) {
        console.log('⚠️ [ENGINE] No text found in event. Skipping.');
        return;
    }

    console.log(`🔎 [ENGINE] Searching automation for keyword: "${triggerText}"`);

    // 2. Find Matching Automation
    // Fix: We need to find an automation where the KEYWORD is contained in the TRIGGER TEXT.
    // PostgREST simple filters make 'column contains variable' hard.
    // For MVP, we fetch active automations and filter in memory.

    const { data: automations } = await supabase
        .from('automations')
        .select('id, org_id, name, keyword')
        .eq('is_active', true);

    const automation = automations?.find(a =>
        a.keyword && triggerText.toLowerCase().includes(a.keyword.toLowerCase())
    );

    if (!automation) {
        console.log(`📭 [ENGINE] No automation found for text: "${triggerText}"`);
        // Log all active keywords to help debugging
        const activeKeywords = automations?.map(a => a.keyword).join(', ');
        console.log(`(Active Keywords available: ${activeKeywords})`);
        return;
    }

    console.log(`✅ [ENGINE] Found Automation: ${automation.name} (${automation.id})`);

    // 3. Load Latest Flow Version
    const { data: version } = await supabase
        .from('automation_versions')
        .select('nodes_json, edges_json')
        .eq('automation_id', automation.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    if (!version) {
        console.log('⚠️ [ENGINE] Automation has no saved version/flow.');
        return;
    }

    // Parse JSON if needed
    const nodes: FlowNode[] = typeof version.nodes_json === 'string' ? JSON.parse(version.nodes_json) : version.nodes_json;
    const edges: FlowEdge[] = typeof version.edges_json === 'string' ? JSON.parse(version.edges_json) : version.edges_json;

    // 4. Traverse Logic (Simple: Find Start -> Find Next -> Execute)

    // 4.1 Find Trigger Node (Start)
    const startNode = nodes.find(n => n.type === 'trigger');
    if (!startNode) {
        console.error('❌ [ENGINE] No Trigger node found in flow.');
        return;
    }

    // 4.2 Find Connected Nodes (Next Step)
    // Find edges where source is the startNode
    const nextEdges = edges.filter(e => e.source === startNode.id);

    if (nextEdges.length === 0) {
        console.log('⏹️ [ENGINE] Flow ends after trigger (no connections).');
        return;
    }

    // 4.3 Execute Next Nodes
    for (const edge of nextEdges) {
        const nextNodeId = edge.target;
        const nextNode = nodes.find(n => n.id === nextNodeId);

        if (nextNode) {
            await executeNode(nextNode, instagramUserId, triggerCommentId, supabase, automation.id);
        }
    }
}

async function executeNode(node: FlowNode, userId: string, commentId: string, supabase: any, automationId: string) {
    console.log(`⚙️ [ENGINE] Executing Node: ${node.type} (${node.id})`);

    // Log Execution Start
    await supabase.from('execution_logs').insert({
        automation_id: automationId,
        instagram_user_id: userId,
        status: 'RUNNING'
    });

    switch (node.type) {
        case 'message':
            const message = node.data.label || "Olá! (Mensagem Padrão)";
            console.log(`🚀 [ACTION] Attempting Private Reply to Comment ${commentId}: "${message}"`);

            // Execute Real API Call with Comment ID for Private Reply
            await sendInstagramDM(userId, message, commentId);

            break;

        case 'condition':
            console.log('🤔 [ACTION] Checking condition... (Not implemented)');
            break;

        default:
            console.log(`⚠️ [ENGINE] Unknown node type: ${node.type}`);
    }

    // Log Completion
    // In a real generic engine, we would update the running log row.
}
