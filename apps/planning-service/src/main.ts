import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Planning Service API')
    .setDescription('Budget management, savings goals, and financial automation')
    .setVersion('1.0')
    .addTag('budgets')
    .addTag('goals')
    .addTag('automation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.SERVICE_PORT || 3011;
  await app.listen(port);
  console.log(`🚀 Planning Service running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
