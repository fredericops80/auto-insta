export async function sendInstagramDM(userId: string, text: string, commentId?: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('❌ [INSTAGRAM] Missing INSTAGRAM_ACCESS_TOKEN in env.');
        return false;
    }

    const recipientId = commentId ? `Comment: ${commentId}` : userId;
    console.log(`📤 [INSTAGRAM] Sending DM to ${recipientId}...`);

    try {
        // Correct endpoint for messaging (both standard and private replies are /me/messages)
        const url = `https://graph.facebook.com/v19.0/me/messages`;

        // Private Reply Payload requires specific structure
        const bodyPayload = commentId
            ? {
                recipient: { comment_id: commentId },
                message: { text: text }
            }
            : {
                recipient: { id: userId },
                message: { text: text }
            };

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
