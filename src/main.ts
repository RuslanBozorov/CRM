import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ensureStorageDirs } from './common/utils/storage-paths';

async function bootstrap() {
  ensureStorageDirs();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder()
    .setTitle('CRM_COURSE')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors();
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  Logger.log(`Server is running on port ${port}`);
  Logger.log(`Swagger: /swagger`);
}

bootstrap();
