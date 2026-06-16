import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  })

  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Forum Q&A API')
    .setDescription('HTTP API for a questions and answers forum.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token returned by POST /sessions.',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication endpoints.')
    .addTag('Users', 'User account endpoints.')
    .addTag('Questions', 'Question endpoints.')
    .addTag('Answers', 'Answer endpoints.')
    .addTag('Comments', 'Question and answer comment endpoints.')
    .addTag('Uploads', 'Attachment upload endpoints.')
    .addTag('Notifications', 'Notification endpoints.')
    .addTag('Health', 'Service health and liveness endpoints.')
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('swagger', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  app.use(
    '/docs',
    apiReference({
      content: swaggerDocument,
    }),
  )

  await app.listen(port)
}
bootstrap()
