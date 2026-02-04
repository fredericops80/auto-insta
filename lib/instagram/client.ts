/**
 * Instagram Graph API Client for DMs
 * 
 * Required Env Vars:
 * - INSTAGRAM_ACCESS_TOKEN: Page Access Token with instagram_manage_messages
 * - INSTAGRAM_BUSINESS_ID: Your Instagram Business Account ID (numeric)
 */

export async function sendInstagramDM(userId: string, text: string, commentId?: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igBusinessId = process.env.INSTAGRAM_BUSINESS_ID;

    if (!accessToken) {
        console.error('❌ [INSTAGRAM] Missing INSTAGRAM_ACCESS_TOKEN in env.');
        return false;
    }

    if (!igBusinessId) {
        console.error('❌ [INSTAGRAM] Missing INSTAGRAM_BUSINESS_ID in env.');
        return false;
    }

    const recipientLog = commentId ? `Comment: ${commentId}` : `User: ${userId}`;
    console.log(`📤 [INSTAGRAM] Sending Private Reply to ${recipientLog}...`);

    try {
        // Correct endpoint for Instagram: POST /{ig-user-id}/messages
        const url = `https://graph.facebook.com/v19.0/${igBusinessId}/messages`;

        // Private Reply to Comment
        const bodyPayload = {
            recipient: { comment_id: commentId },
            message: { text: text }
        };

        console.log(`📡 [INSTAGRAM] POST ${url}`);
        console.log(`📦 [INSTAGRAM] Payload:`, JSON.stringify(bodyPayload));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ [INSTAGRAM] API Error:', data.error);
            return false;
        }

        console.log('✅ [INSTAGRAM] Message sent! Message ID:', data.message_id);
        return true;

    } catch (error) {
        console.error('❌ [INSTAGRAM] Network Error:', error);
        return false;
    }
}
