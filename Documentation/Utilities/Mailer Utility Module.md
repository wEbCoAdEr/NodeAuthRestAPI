## Mailer Utility Module Documentation

This document describes the `mailer` module for sending emails using Nodemailer with templating capabilities.

**Module Purpose:**

- Provides functionality to send emails with configurable sender information, recipients, subjects, and content.
- Utilizes Nodemailer for sending emails and integrates handlebars templating for dynamic content.

**Module Usage:**

1. Import the `mailer` module in your controllers or services that require email sending:

```javascript
const { mailer } = require('../utils');
```

2. Utilize the `mailer.send` function to send an email:

```javascript
const emailConfig = {
  toList: ['recipient@example.com'],
  subject: 'Important Message',
  template: 'welcomeEmail', // Name of the Handlebars template
  templateData: { // Data to be passed to the template
    username: 'John Doe'
  }
};

const sendEmail = await mailer.send(emailConfig);
```

**Environment Configuration:**

- The module relies on environment variables for SMTP server configuration details. You should set the following environment variables before using the module:

  | Variable | Description |
    |---|---|
  | `SMTP_HOST` | The hostname or IP address of your SMTP server. |
  | `SMTP_PORT` | The port number used by your SMTP server (typically 25, 465, or 587). |
  | `SMTP_USER` | The username for authentication with your SMTP server. |
  | `SMTP_PASS` | The password for authentication with your SMTP server. |
  | `SMTP_FROM` (Optional) | The email address used as the sender for emails sent through this module. Defaults to an empty string. |

**Sending an Email:**

The `mailer.send` function accepts an email configuration object as input:

- `fromName` (Optional): Name of the sender (defaults to `config.SMTP_FROM`).
- `fromAddress` (Optional): Email address of the sender (defaults to `config.SMTP_USER`).
- `toList`: Array of recipient email addresses.
- `subject`: Subject line of the email.
- `template`: Name of the Handlebars template file for the email content (located in `./views/emails`).
- `templateData`: Object containing data to be passed to the Handlebars template.

**Sending Process:**

1. The function extracts email configuration details from the provided object.
2. It constructs the sender email address and a comma-separated string of recipient addresses.
3. It utilizes the Nodemailer transporter to send the email using the specified configuration and template.
4. Upon successful email sending, the message ID is logged using the `logger` module.
5. In case of errors, the error is logged using the `logger` and the function resolves to `false`.

**Template System:**

- The module integrates Nodemailer-Express-Handlebars for dynamic content creation using Handlebars templates.
- Templates reside in the `./views/emails` directory.
- The `template` property in the email configuration object specifies the template file to be used.
- The `templateData` property provides data to be populated within the template.

**Benefits:**

- Centralized email sending logic simplifies email functionality in your application.
- Handlebars templating allows for dynamic and reusable email content.
- Configuration options provide flexibility in email server settings and sender information.
- The integration with the `logger` module facilitates logging of email sending activities and errors.

By employing the `mailer` module, you can streamline email sending within your application, leveraging templating for efficient and maintainable email content.