import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';
import { EmailConfig } from '../config';
import {
  EmailOptions,
  TemplateEmailOptions,
  EmailResult,
} from '../types';
import { TemplateService } from './template.service';

export class EmailService {
  private readonly transporter: Transporter<SentMessageInfo>;
  private readonly config: EmailConfig;
  private readonly templateService: TemplateService;

  constructor(config: EmailConfig, templatePath?: string) {
    this.config = config;
    
    const transportOptions: SMTPOptions = {
      host: config.host,
      port: config.port,
      secure: config.secure ?? false,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    };
    
    this.transporter = nodemailer.createTransport(transportOptions);
    this.templateService = new TemplateService(templatePath);
  }

  /**
   * Send a plain email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(', ')
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(', ')
            : options.bcc
          : undefined,
        attachments: options.attachments,
        replyTo: options.replyTo,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(
    options: TemplateEmailOptions
  ): Promise<EmailResult> {
    try {
      const html = await this.templateService.render(
        options.template,
        options.context
      );

      return this.sendEmail({
        to: options.to,
        subject: options.subject,
        html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        replyTo: options.replyTo,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  /**
   * Close the transporter connection
   */
  close(): void {
    this.transporter.close();
  }
}
