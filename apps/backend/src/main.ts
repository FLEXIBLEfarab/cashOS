import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
    bufferLogs: true,
  });

  // ─── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true,
  });

  // ─── Global validation pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // удаляет незадекларированные поля
      forbidNonWhitelisted: true,  // выбрасывает ошибку при лишних полях
      transform: true,             // автоматическое преобразование типов
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global exception filter ───────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global interceptors ───────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  // ─── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Четка SaaS API')
    .setDescription(
      `
## 📋 REST API для SaaS-системы автоматизации ритейла «Четка»

**Рынок:** Казахстан (KZ)  
**Валюта:** Казахстанский тенге (₸, KZT)  
**Временная зона:** UTC+5 (Алматы) / UTC+6 (Нур-Султан)

### Аутентификация
Используйте JWT Bearer токен. Получите токен через \`POST /v1/auth/login\`.
      `.trim(),
    )
    .setVersion('1.0.0')
    .setContact('Команда Четка', 'https://chetka.kz', 'dev@chetka.kz')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Authorization',
        description: 'Введите JWT access токен (получить через POST /v1/auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', '🔐 Аутентификация и управление сессиями')
    .addTag('POS', '🧾 Кассовые операции (Point of Sale)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Четка API Docs',
  });

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Четка Backend запущен: http://localhost:${port}`);
  logger.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Окружение: ${process.env.NODE_ENV ?? 'development'}`);
}

bootstrap();
