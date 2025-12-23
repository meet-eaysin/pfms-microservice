import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('PFMS Auth Service')
      .setDescription('Authentication & Authorization API with better-auth')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const PORT = process.env.SERVICE_PORT || 3001;
  const HOST = process.env.HOST || '0.0.0.0';

  await app.listen(PORT, HOST);

  logger.log(`
╔════════════════════════════════════════════════════╗
║    🔐 Auth Service Started on Port ${PORT}! 🔐     ║
╚════════════════════════════════════════════════════╝

📍 Binding: ${HOST}:${PORT}
🔒 Security Mode: ${process.env.NODE_ENV || 'development'}
🌐 Network: Internal Docker network (Kong Gateway required)
📚 API Docs: http://localhost:${PORT}/api/docs

✅ Features Enabled:
  ✓ Email/Password Authentication
  ✓ OAuth (Google, GitHub, Facebook)
  ✓ MFA (TOTP, SMS, Email)
  ✓ Session Management
  ✓ Password Reset
  ✓ Email Verification
  ✓ Rate Limiting
  ✓ Audit Logging

⚠️  Direct access: Blocked by Docker network isolation
  `);
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});
