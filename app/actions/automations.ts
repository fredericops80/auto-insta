'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function saveAutomationFlow(nodes: any[], edges: any[]) {
    const supabase = await createAdminClient();

    try {
        // 1. Check for existing Organization (Mock Auth for MVP)
        // In a real app, we would get this from auth.getUser() session.
        // Here we try to find the first org, or create a demo one.
        let { data: org } = await supabase.from('organizations').select('id, owner_id').limit(1).single();

        if (!org) {
            // Seed Demo User (if needed) - Hard to do without admin key if users table is protected.
            // We will assume the user manually inserted rows OR we just rely on anon key permissions.
            // Actually, profile creation requires a user in auth.users.
            // PLAN B: Use a UUID hardcoded if we can't create users. 
            // Better: Just FAIL gracefully and ask user to sign up? 
            // No, user wants it to work.
            // Let's try to fetch ANY profile first.
            const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();

            if (profile) {
                // Create Org for this profile
                const { data: newOrg, error: orgError } = await supabase.from('organizations').insert({
                    name: 'Demo Agency',
                    owner_id: profile.id
                }).select().single();
                if (orgError) throw orgError;
                org = newOrg;
            } else {
                // We are stuck if we can't create users.
                // Return a specific error telling user to create a user in Supabase or run a SQL seed.
                return { success: false, error: 'NO_ORG_FOUND' };
            }
        }

        if (!org) return { success: false, error: 'Failed to find or create Organization' };

        // 2. Find or Create Automation
        // For MVP, we will just use a single "Draft Automation" per Org.
        let { data: automation } = await supabase
            .from('automations')
            .select('id')
            .eq('org_id', org.id)
            .eq('name', 'Fluxo Principal (Draft)')
            .single();

        if (!automation) {
            const { data: newAuto, error: autoError } = await supabase.from('automations').insert({
                org_id: org.id,
                name: 'Fluxo Principal (Draft)',
                trigger_type: 'COMMENT',
                keyword: 'quero',
                is_active: true
            }).select().single();
            if (autoError) throw autoError;
            automation = newAuto;
        } else {
            // [UPDATE] Extract Trigger Keyword from current nodes to update the DB
            // This ensures the Engine can find the automation by the new keyword
            const triggerNode = nodes.find((n: any) => n.type === 'trigger');
            if (triggerNode && triggerNode.data && triggerNode.data.label) {
                const newKeyword = triggerNode.data.label;
                console.log('Updating automation keyword to:', newKeyword);

                await supabase.from('automations')
                    .update({
                        keyword: newKeyword,
                        is_active: true
                    })
                    .eq('id', automation.id);
            }
        }

        if (!automation) return { success: false, error: 'Falha crítica ao recuperar automação.' };

        // 3. Save Version
        const { error: versionError } = await supabase.from('automation_versions').insert({
            automation_id: automation.id,
            nodes_json: nodes, // FIX: Pass object directly, Supabase handles it for JSONB
            edges_json: edges, // FIX: Pass object directly
            version_number: Math.floor(Date.now() / 1000)
        });

        if (versionError) throw versionError;

        return { success: true, message: 'Fluxo salvo com sucesso!' };

    } catch (error: any) {
        console.error('Error saving flow:', error);
        return { success: false, error: error.message };
    }
}

export async function getAutomationFlow() {
    const supabase = await createAdminClient();
    console.log('--- GETTING FLOW ---');

    try {
        // 1. Get Automation
        const { data: automation } = await supabase
            .from('automations')
            .select('id, org_id')
            .eq('name', 'Fluxo Principal (Draft)')
            .single();

        console.log('Automation found:', automation);

        if (!automation) {
            console.log('No automation found with name "Fluxo Principal (Draft)"');
            return { nodes: null, edges: null };
        }

        // 2. Get Latest Version
        const { data: version } = await supabase
            .from('automation_versions')
            .select('nodes_json, edges_json, version_number')
            .eq('automation_id', automation.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        console.log('Version found:', version ? `Version #${version.version_number}` : 'None');

        if (!version) return { nodes: null, edges: null };

        // FIX: Handle both String (legacy/wrongly saved) and Object (correctly saved)
        const nodes = typeof version.nodes_json === 'string'
            ? JSON.parse(version.nodes_json)
            : version.nodes_json;

        const edges = typeof version.edges_json === 'string'
            ? JSON.parse(version.edges_json)
            : version.edges_json;

        return { nodes, edges };

    } catch (error) {
        console.error('Error fetching flow:', error);
        return { nodes: null, edges: null };
    }
}
