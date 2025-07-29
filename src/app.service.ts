import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
  private readonly webhookSecret =
    '18c95d35b064057a8233c18dfa16f952ad382f7b24bdb3cb0eacb5e147addb54';

  getHello(): string {
    return 'Hello World!';
  }

  verifyWebhookSignature(
    rawBody: Buffer<ArrayBufferLike>,
    signature: string,
  ): boolean {
    if (!signature) {
      throw new UnauthorizedException('Missing X-Therame-Signature header');
    }

    // Extract the signature hash from "sha256=<hash>" format
    const signatureParts = signature.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
      throw new UnauthorizedException('Invalid signature format');
    }

    const receivedSignature = signatureParts[1];

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(rawBody.toString('utf8'));
    const expectedSignature = hmac.digest('hex');

    console.log('Expected Signature:', expectedSignature);

    // Use crypto.timingSafeEqual to prevent timing attacks
    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    console.log('Signature verification result:', isValid);

    return isValid;
  }

  processWebhook(payload: unknown): string {
    // Process the webhook payload here
    console.log('Processing webhook payload:', payload);
    return 'Webhook processed successfully';
  }
}
