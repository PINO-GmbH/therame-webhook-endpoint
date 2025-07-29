import {
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('therame-webhook')
  processWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-therame-signature') signature: string,
    @Headers('x-therame-event') eventType: string,
    @Headers('x-therame-event-id') eventId: string,
  ): string {
    console.log('Received webhook request');

    // Get the raw body as buffer for signature verification
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Missing request body');
    }

    console.log('Raw body (buffer):', rawBody);
    console.log('Raw body (string):', rawBody.toString('utf8'));
    console.log('Signature:', signature);
    console.log('Event Type:', eventType);
    console.log('Event ID:', eventId);

    // Verify the webhook signature with event reconstruction
    const isValidSignature = this.appService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    console.log('Signature verified successfully');

    return this.appService.processWebhook(rawBody);
  }
}
