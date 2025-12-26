import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());

  app.useStaticAssets(join(process.cwd(), 'assets'), {
    prefix: '/assets',
  });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Example API')
      .setDescription('Example API description')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

  const port = parseInt(process.env.PORT ?? '8080', 10);
  // Railway/Render/etc. require binding to 0.0.0.0
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch(console.error);
