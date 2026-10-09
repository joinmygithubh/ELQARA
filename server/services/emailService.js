/**
 * ELQARA — Atelier Email Service
 * Production-compatible email notification delivery system for Cloudflare Workers & Node.js
 */

const DEFAULT_DESTINATION = 'elqara.home@gmail.com';
const DEFAULT_SENDER = 'ELQARA Atelier <onboarding@resend.dev>';

/**
 * Sanitize untrusted customer input to prevent HTML/XSS injection in emails
 */
export const escapeHtml = (unsafe) => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Strip CRLF to prevent header injection in email subjects or recipients
 */
const sanitizeHeader = (val) => {
  if (!val) return '';
  return String(val).replace(/[\r\n]+/g, ' ').trim();
};

/**
 * Format Indian / International date-time for email metadata
 */
const formatSubmissionTime = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  } catch {
    return date.toUTCString();
  }
};

/**
 * Generate a luxury, high-conversion HTML email template for ELQARA
 */
export const buildEnquiryEmailHtml = (enquiry) => {
  const safeName = escapeHtml(enquiry.name);
  const safeEmail = escapeHtml(enquiry.email);
  const safePhone = escapeHtml(enquiry.phone || 'Not provided');
  const safeSubject = escapeHtml(enquiry.subject || 'Product Inquiry');
  const safeMessage = escapeHtml(enquiry.message).replace(/\n/g, '<br/>');
  const safeProductName = escapeHtml(enquiry.productName);
  const safeProductSku = escapeHtml(enquiry.productSku);
  const safeProductUrl = enquiry.productUrl ? escapeHtml(enquiry.productUrl) : '';
  const safeQuantity = enquiry.quantity ? escapeHtml(enquiry.quantity) : '';
  const safePreferredContact = escapeHtml(enquiry.preferredContact || 'Email');
  const timestamp = formatSubmissionTime(enquiry.createdAt || new Date());
  const refId = enquiry._id ? escapeHtml(String(enquiry._id)) : 'NEW';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ELQARA Customer Enquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 6px; overflow: hidden; border: 1px solid #E7E3DA; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Editorial Header -->
          <tr>
            <td style="background-color: #1C1B18; padding: 36px 32px; text-align: center; border-bottom: 3px solid #C4704F;">
              <span style="font-family: Georgia, serif; font-size: 28px; letter-spacing: 0.18em; color: #FAF7F2; display: block; font-weight: 400; text-transform: uppercase;">
                ELQARA
              </span>
              <span style="display: block; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #C4704F; margin-top: 6px; font-weight: 600;">
                Objects for Living • Atelier Concierge
              </span>
            </td>
          </tr>

          <!-- Banner Title -->
          <tr>
            <td style="padding: 28px 32px 12px; background-color: #FFFFFF;">
              <div style="display: inline-block; background-color: #F3ECE1; color: #8C5338; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; border-radius: 3px; margin-bottom: 12px;">
                New Customer Enquiry
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #1C1917; margin: 0 0 8px; line-height: 1.3;">
                ${safeProductName ? `Inquiry regarding <strong style="color: #8C5338;">${safeProductName}</strong>` : safeSubject}
              </h1>
              <p style="font-size: 13px; color: #78716C; margin: 0; line-height: 1.5;">
                A prospective client has submitted an inquiry through the ELQARA online atelier. Details and transmission logs follow below.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 12px 32px;">
              <hr style="border: 0; border-top: 1px solid #E7E3DA; margin: 0;">
            </td>
          </tr>

          <!-- Customer Information Section -->
          <tr>
            <td style="padding: 8px 32px 16px;">
              <h2 style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #8C5338; margin: 0 0 12px; font-weight: 700;">
                1. Customer Information
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border-radius: 4px; border: 1px solid #ECE7DE;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; width: 140px; border-bottom: 1px solid #EFEAE1;">Full Name:</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1C1917; border-bottom: 1px solid #EFEAE1;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; border-bottom: 1px solid #EFEAE1;">Email Address:</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #1C1917; border-bottom: 1px solid #EFEAE1;">
                    <a href="mailto:${safeEmail}" style="color: #8C5338; text-decoration: none; font-weight: 600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; border-bottom: 1px solid #EFEAE1;">Telephone / WhatsApp:</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #1C1917; border-bottom: 1px solid #EFEAE1;">
                    ${enquiry.phone ? `<a href="tel:${safePhone}" style="color: #1C1917; text-decoration: none;">${safePhone}</a>` : '<span style="color: #A8A29E; font-style: italic;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C;">Preferred Contact:</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1C1917;">${safePreferredContact}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${safeProductName ? `
          <!-- Product Information Section -->
          <tr>
            <td style="padding: 8px 32px 16px;">
              <h2 style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #8C5338; margin: 0 0 12px; font-weight: 700;">
                2. Referenced Piece & Specifications
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border-radius: 4px; border: 1px solid #ECE7DE;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; width: 140px; border-bottom: 1px solid #EFEAE1;">Design Name:</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1C1917; border-bottom: 1px solid #EFEAE1;">${safeProductName}</td>
                </tr>
                ${safeProductSku ? `
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; border-bottom: 1px solid #EFEAE1;">SKU / Reference:</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-family: monospace; color: #1C1917; border-bottom: 1px solid #EFEAE1;">${safeProductSku}</td>
                </tr>` : ''}
                ${safeQuantity ? `
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C; border-bottom: 1px solid #EFEAE1;">Requested Quantity:</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #1C1917; font-weight: 600; border-bottom: 1px solid #EFEAE1;">${safeQuantity} units</td>
                </tr>` : ''}
                ${safeProductUrl ? `
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #78716C;">Live Catalog URL:</td>
                  <td style="padding: 10px 14px; font-size: 13px;">
                    <a href="${safeProductUrl}" target="_blank" style="color: #8C5338; text-decoration: underline; word-break: break-all;">View Product on Storefront →</a>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>` : ''}

          <!-- Customer Message Section -->
          <tr>
            <td style="padding: 8px 32px 24px;">
              <h2 style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #8C5338; margin: 0 0 12px; font-weight: 700;">
                ${safeProductName ? '3. Client Message & Requirements' : '2. Message'}
              </h2>
              <div style="background-color: #FAF7F2; border-left: 3px solid #C4704F; padding: 16px 18px; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.6; color: #292524; font-family: Georgia, serif; font-style: italic;">
                "${safeMessage}"
              </div>
            </td>
          </tr>

          <!-- Action Button: Reply Directly -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <a href="mailto:${safeEmail}?subject=Re:%20ELQARA%20Enquiry%20%E2%80%94%20${encodeURIComponent(enquiry.productName || enquiry.subject || 'Atelier Response')}" 
                 style="display: inline-block; background-color: #1C1B18; color: #FAF7F2; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 12px 28px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                Reply to ${safeName} (${safeEmail})
              </a>
            </td>
          </tr>

          <!-- Metadata Footer -->
          <tr>
            <td style="background-color: #F7F4EE; padding: 20px 32px; border-top: 1px solid #ECE7DE; font-size: 11px; color: #78716C; line-height: 1.6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <strong>Submission Reference:</strong> ${refId}<br>
                    <strong>Timestamp:</strong> ${timestamp}<br>
                    ${enquiry.ipAddress ? `<strong>Client IP:</strong> ${escapeHtml(enquiry.ipAddress)}` : ''}
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="font-family: Georgia, serif; font-size: 12px; color: #8C5338; font-weight: bold;">
                      ELQARA ATELIER
                    </span><br>
                    Objects for Living
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Micro Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #A8A29E; line-height: 1.4;">
              This notification was generated automatically by the ELQARA e-commerce inquiry gateway.<br>
              Target Recipient: <strong style="color: #78716C;">${DEFAULT_DESTINATION}</strong>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Generate plain-text fallback for email clients
 */
export const buildEnquiryEmailText = (enquiry) => {
  const lines = [
    '====================================================',
    'ELQARA — NEW CUSTOMER ENQUIRY',
    '====================================================',
    '',
    `Customer Name:    ${enquiry.name}`,
    `Customer Email:   ${enquiry.email}`,
    `Customer Phone:   ${enquiry.phone || 'Not provided'}`,
    `Preferred Method: ${enquiry.preferredContact || 'Email'}`,
    '',
    '----------------------------------------------------',
    'PRODUCT / INQUIRY DETAILS',
    '----------------------------------------------------',
    `Subject:          ${enquiry.subject || 'Product Inquiry'}`,
    enquiry.productName ? `Product Name:     ${enquiry.productName}` : null,
    enquiry.productSku ? `SKU / Reference:  ${enquiry.productSku}` : null,
    enquiry.quantity ? `Quantity:         ${enquiry.quantity}` : null,
    enquiry.productUrl ? `Product URL:      ${enquiry.productUrl}` : null,
    '',
    '----------------------------------------------------',
    'MESSAGE',
    '----------------------------------------------------',
    enquiry.message,
    '',
    '----------------------------------------------------',
    `Submitted At:     ${formatSubmissionTime(enquiry.createdAt || new Date())}`,
    `Reference ID:     ${enquiry._id || 'NEW'}`,
    '===================================================='
  ];

  return lines.filter((l) => l !== null).join('\n');
};

/**
 * Send an enquiry email notification to elqara.home@gmail.com
 * Supports Resend, SendGrid, Brevo, and resilient fallback
 */
export const sendEnquiryNotification = async (enquiry) => {
  const destinationEmail = process.env.ENQUIRY_EMAIL || DEFAULT_DESTINATION;
  const fromEmail = process.env.EMAIL_FROM || DEFAULT_SENDER;

  const subjectProduct = enquiry.productName ? enquiry.productName : (enquiry.subject || 'Bespoke Inquiry');
  const subject = sanitizeHeader(`New ELQARA Product Enquiry — ${subjectProduct} (${enquiry.name})`);

  const html = buildEnquiryEmailHtml(enquiry);
  const text = buildEnquiryEmailText(enquiry);

  const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  // 1. Resend HTTP REST API Delivery (Default recommended for Cloudflare Workers & Modern Edge)
  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [destinationEmail],
          reply_to: enquiry.email,
          subject,
          html,
          text
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
        console.error('[EmailService:Resend Error]:', errorMsg);
        throw new Error(`Resend delivery failed: ${errorMsg}`);
      }

      console.log(`[EmailService] Notification successfully delivered via Resend to ${destinationEmail} (ID: ${data.id})`);
      return {
        success: true,
        provider: 'resend',
        messageId: data.id
      };
    } catch (err) {
      console.error('[EmailService] Resend dispatch exception:', err.message);
      throw err;
    }
  }

  // 2. SendGrid HTTP REST API Delivery
  if (sendgridKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: destinationEmail }] }],
          from: { email: fromEmail.includes('<') ? fromEmail.match(/<([^>]+)>/)[1] : fromEmail, name: 'ELQARA Atelier' },
          reply_to: { email: enquiry.email, name: enquiry.name },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[EmailService:SendGrid Error]:', errText);
        throw new Error(`SendGrid delivery failed: ${response.status} ${errText}`);
      }

      console.log(`[EmailService] Notification successfully delivered via SendGrid to ${destinationEmail}`);
      return {
        success: true,
        provider: 'sendgrid'
      };
    } catch (err) {
      console.error('[EmailService] SendGrid dispatch exception:', err.message);
      throw err;
    }
  }

  // 3. Brevo (Sendinblue) HTTP REST API Delivery
  if (brevoKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: fromEmail.includes('<') ? fromEmail.match(/<([^>]+)>/)[1] : fromEmail, name: 'ELQARA Atelier' },
          to: [{ email: destinationEmail }],
          replyTo: { email: enquiry.email, name: enquiry.name },
          subject,
          htmlContent: html,
          textContent: text
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP ${response.status}`;
        console.error('[EmailService:Brevo Error]:', errorMsg);
        throw new Error(`Brevo delivery failed: ${errorMsg}`);
      }

      console.log(`[EmailService] Notification successfully delivered via Brevo to ${destinationEmail} (MessageId: ${data.messageId})`);
      return {
        success: true,
        provider: 'brevo',
        messageId: data.messageId
      };
    } catch (err) {
      console.error('[EmailService] Brevo dispatch exception:', err.message);
      throw err;
    }
  }

  // 4. Fallback / Development Simulation mode:
  // If no email API key is configured yet in environment:
  if (process.env.NODE_ENV === 'production') {
    // In strict production, if no email service key is provided, log warning and throw to avoid false success
    const errMessage = 'Email service provider is not configured. Please set RESEND_API_KEY, SENDGRID_API_KEY, or BREVO_API_KEY.';
    console.error(`[EmailService Configuration Notice]: ${errMessage}`);
    throw new Error(errMessage);
  } else {
    // In development mode, log full formatted email to console for developer verification
    console.log('----------------------------------------------------');
    console.log(`[EmailService: Dev Simulation Mode] Email intended for: ${destinationEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Customer: ${enquiry.name} <${enquiry.email}> | Phone: ${enquiry.phone || 'N/A'}`);
    console.log(`Product: ${enquiry.productName || 'None'} | SKU: ${enquiry.productSku || 'N/A'}`);
    console.log(`Message: ${enquiry.message}`);
    console.log('----------------------------------------------------');
    return {
      success: true,
      provider: 'development-simulation',
      simulated: true,
      destination: destinationEmail
    };
  }
};

/**
 * Send password reset verification code to customer
 */
export const sendPasswordResetNotification = async (recipient, resetCode) => {
  const fromEmail = process.env.EMAIL_FROM || DEFAULT_SENDER;
  const userEmail = recipient.email;
  const userName = escapeHtml(recipient.name || 'Valued Collector');
  const safeCode = escapeHtml(resetCode);

  const subject = 'ELQARA — Your Password Reset Verification Code';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 6px; overflow: hidden; border: 1px solid #E7E3DA; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #1C1B18; padding: 32px 28px; text-align: center; border-bottom: 3px solid #C4704F;">
              <span style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.18em; color: #FAF7F2; text-transform: uppercase;">
                ELQARA
              </span>
              <span style="display: block; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #C4704F; margin-top: 6px; font-weight: 600;">
                Objects for Living • Security
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px 20px;">
              <h1 style="font-family: Georgia, serif; font-size: 20px; font-weight: 400; color: #1C1917; margin: 0 0 12px;">
                Password Reset Request
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px;">
                Dear ${userName}, we received a request to reset your ELQARA collector account password. Use the verification code below to authorize your password update.
              </p>
              <div style="background-color: #FAF7F2; border: 1px solid #ECE7DE; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8C5338; font-weight: 700; margin-bottom: 8px;">
                  Your Verification Code
                </span>
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #1C1917;">
                  ${safeCode}
                </span>
                <span style="display: block; font-size: 12px; color: #A8A29E; margin-top: 8px;">
                  Valid for 15 minutes only
                </span>
              </div>
              <p style="font-size: 12px; line-height: 1.5; color: #78716C; margin: 0;">
                If you did not initiate this request, you can safely disregard this message. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F7F4EE; padding: 16px 28px; border-top: 1px solid #ECE7DE; font-size: 11px; color: #A8A29E; text-align: center;">
              ELQARA Atelier • Objects for Living
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `ELQARA — Password Reset Verification Code\n\nDear ${userName},\n\nYour 6-digit verification code is: ${safeCode}\n\nThis code is valid for 15 minutes.\nIf you did not request this, please ignore this email.\n\nELQARA Atelier`;

  const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [userEmail],
          subject,
          html,
          text
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('[EmailService:ResetPassword Resend Error]:', data);
        throw new Error(`Resend password reset delivery failed: ${data?.message || response.statusText}`);
      }

      return { success: true, provider: 'resend', id: data.id };
    } catch (err) {
      console.error('[EmailService:ResetPassword Exception]:', err.message);
      throw err;
    }
  }

  // Fallback for development simulation
  console.log('----------------------------------------------------');
  console.log(`[EmailService: Password Reset Simulation] Code for ${userEmail}: [${safeCode}]`);
  console.log('----------------------------------------------------');
  return { success: true, simulated: true };
};
