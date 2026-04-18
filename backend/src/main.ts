import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('VillageCircle360 API')
    .setDescription('UK group savings and loan circle management - MVP')
    .setVersion('1.0')
    .addTag('groups', 'Circle/group management')
    .addTag('members', 'Member management')
    .addTag('contributions', 'Append-only contribution records')
    .addTag('loans', 'Loans and repayments')
    .addTag('social-fund', 'Social fund buckets and entries')
    .addTag('audit', 'Audit events')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
