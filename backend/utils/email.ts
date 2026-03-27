import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"WorkFlow" <noreply@workflow.com>';

  if (!host || !user || !pass) {
    const msg = 'Email Error: Missing SMTP configuration (HOST, USER, or PASS).';
    console.error(msg);
    if ((global as any).setLastEmailError) (global as any).setLastEmailError(msg);
    return;
  }

  console.log(`Attempting to send email to ${to} via ${host}:${port}...`);
  console.log(`Using FROM address: ${from}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
    tls: {
      // Do not fail on invalid certs (common for some SMTP servers)
      rejectUnauthorized: false
    },
    // Add timeout to avoid hanging
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    // Verify connection configuration
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully.');

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    if ((global as any).setLastEmailError) (global as any).setLastEmailError(null);
  } catch (error: any) {
    console.error('CRITICAL EMAIL ERROR:', error);
    let errorMsg = 'Unknown email error';
    
    if (error.code === 'EAUTH') {
      errorMsg = 'Authentication failed. If using Gmail, ensure you use an "App Password" and 2FA is enabled.';
    } else if (error.code === 'ESOCKET') {
      errorMsg = `Connection failed to ${host}:${port}. Check if the host/port are correct and not blocked.`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMsg = 'Connection timed out. The SMTP server might be slow or unreachable.';
    } else if (error.message) {
      errorMsg = error.message;
    }

    console.error('Email Error Detail:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message
    });

    if ((global as any).setLastEmailError) (global as any).setLastEmailError(errorMsg);
  }
};
