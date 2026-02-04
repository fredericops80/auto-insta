export async function sendInstagramDM(userId: string, text: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('❌ [INSTAGRAM] Missing INSTAGRAM_ACCESS_TOKEN in env.');
        return false;
    }

    console.log(`📤 [INSTAGRAM] Sending DM to ${userId}...`);

    try {
        const url = `https://graph.facebook.com/v21.0/${userId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                recipient: { id: userId },
                message: { text: text }
            })
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
