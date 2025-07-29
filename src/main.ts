import { NestFactory } from '@nestjs/core';
import { rawBodyMiddleware } from 'src/raw-body.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    rawBodyMiddleware({
      limit: '10mb',
      rawBodyUrls: [`/therame-webhook`],
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
