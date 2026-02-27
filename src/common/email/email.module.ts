import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { TEMPLATES_DIR } from '../utils/storage-paths';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER ?? process.env.EMAIL,
          pass: process.env.SMTP_PASS ?? process.env.PASS,
        },
      },
      defaults: {
        from:
          process.env.MAIL_FROM ??
          process.env.SMTP_USER ??
          process.env.EMAIL,
      },
      template: {
        dir: TEMPLATES_DIR,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
