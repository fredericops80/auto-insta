import { NextRequest, NextResponse } from 'next/server';
import { processWebhookEvent } from '@/lib/automation/engine';
import crypto from 'crypto';

// Verify Token defined in Meta App Dashboard
const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// 1. GET Request: Used by Facebook/Instagram to verify the webhook URL
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }

    return new NextResponse('Bad Request', { status: 400 });
}

// 2. POST Request: Receives the actual events (comments, messages)
export async function POST(req: NextRequest) {
    try {
        const body = await req.text(); // Get raw body for signature verification

        // TODO: Validate X-Hub-Signature-256 using APP_SECRET

        const json = JSON.parse(body);

        // Check if this is a page/instagram event
        if (json.object === 'instagram' || json.object === 'page') {

            // Iterate over entries
            for (const entry of json.entry) {
                // Iterate over messaging events (if any)
                if (entry.messaging) {
                    for (const event of entry.messaging) {
                        console.log('Received Messaging Event:', event);
                        // Trigger Engine
                        await processWebhookEvent(event);
                    }
                }

                // Handle "changes" (comments usually come here for Instagram Graph API depending on subscription)
                if (entry.changes) {
                    for (const change of entry.changes) {
                        console.log('Received Change Event:', change);
                        // Trigger Engine for Comment
                        await processWebhookEvent(change);
                    }
                }
            }

            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        } else {
            return new NextResponse('Page Not Found', { status: 404 });
        }

    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
