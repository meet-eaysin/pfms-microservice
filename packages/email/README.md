# @pfms/email

Email service package for PFMS microservices.

## Features

- Send transactional emails
- Template-based email rendering with Handlebars
- Support for multiple email providers
- Email queue management
- Attachments support

## Installation

```bash
pnpm add @pfms/email
```

## Usage

```typescript
import { EmailService, EmailConfig } from '@pfms/email';

// Configure email service
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: {
    name: 'PFMS',
    email: 'noreply@pfms.com',
  },
};

// Create email service instance
const emailService = new EmailService(emailConfig);

// Send a simple email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to PFMS',
  text: 'Welcome to our platform!',
  html: '<h1>Welcome to our platform!</h1>',
});

// Send email with template
await emailService.sendTemplateEmail({
  to: 'user@example.com',
  subject: 'Welcome to PFMS',
  template: 'welcome',
  context: {
    userName: 'John Doe',
    activationLink: 'https://pfms.com/activate',
  },
});
```

## Configuration

The email service requires the following environment variables:

- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `SMTP_FROM_NAME`: Sender name
- `SMTP_FROM_EMAIL`: Sender email address

## Templates

Email templates are stored in the `templates` directory and use Handlebars syntax.

Example template (`welcome.hbs`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to PFMS</title>
</head>
<body>
  <h1>Welcome, {{userName}}!</h1>
  <p>Thank you for joining our platform.</p>
  <a href="{{activationLink}}">Activate your account</a>
</body>
</html>
```

## License

MIT
