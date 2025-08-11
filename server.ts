// Simple Therame API-signing example (Express + TypeScript)

import crypto from 'crypto';
import 'dotenv/config';
import express, { Request, Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT ?? 3100);

// Use raw body for the webhook route (required for signature verification)
app.use('/therame-webhook', express.raw({ type: 'application/json', limit: '10mb' }));

const verifySignature = (rawBody: Buffer, signature: string | undefined, secret: string) => {
  if (!signature) {
    return { ok: false, reason: 'Missing X-Therame-Signature header' } as const;
  }

  const parts = String(signature).split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return { ok: false, reason: 'Invalid signature format' } as const;
  }

  const receivedSignature = parts[1];

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody.toString('utf8'));
  const expectedSignature = hmac.digest('hex');

  const receivedBuffer = Buffer.from(receivedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return { ok: false, reason: 'Signature length mismatch' } as const;
  }

  const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  return { ok: isValid, expected: expectedSignature } as const;
}

// Example webhook endpoint
app.post('/therame-webhook', (req: Request, res: Response) => {
  console.log('Received webhook request');
  const signature = req.header('x-therame-signature') ?? undefined;
  const eventType = req.header('x-therame-event');
  const eventId = req.header('x-therame-event-id');

  const rawBody = req.body as unknown as Buffer; // express.raw sets req.body to Buffer
  if (!rawBody) {
    return res.status(400).json({ error: 'Missing request body' });
  }

  const secret = process.env.WEBHOOK_SECRET as string;

  const result = verifySignature(rawBody, signature, secret);
  if (!result.ok) {
    console.log('Signature verification failed:', result.reason);
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  console.log('Signature verified successfully');
  console.log('Raw body (string):', rawBody.toString('utf8'));
  console.log('Signature (header):', signature);
  console.log('Expected (computed):', `sha256=${result.expected}`);
  console.log('Event Type:', eventType);
  console.log('Event ID:', eventId);

  // Process webhook payload here
  return res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening on http://localhost:${PORT}`);
});
