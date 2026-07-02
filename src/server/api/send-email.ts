export default defineEventHandler(async (event) => {
  const { req, res } = event.node as any;

  if (req.method !== 'POST') {
    setResponseStatus(res, 405);
    return { error: 'Method not allowed' };
  }

  const body = await readBody(event);
  const { name, email, topic, message, attachments } = body || {};

  if (!name || !email || !topic || !message) {
    setResponseStatus(res, 400);
    return { error: 'Missing required fields' };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    setResponseStatus(res, 500);
    return {
      error: 'Email provider not configured. Set RESEND_API_KEY in your environment.',
    };
  }

  const textBody = `New consultation request from ${name} <${email}>:\n\nTopic: ${topic}\n\nMessage:\n${message}`;

  // Build HTML body and embed attachments as inline images (data URLs)
  let htmlBody = `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Topic:</strong> ${topic}</p><p>${message.replace(/\n/g, '<br/>')}</p>`;
  if (Array.isArray(attachments) && attachments.length > 0) {
    htmlBody += '<hr/><p><strong>Attachments:</strong></p>';
    attachments.forEach((att: any, idx: number) => {
      const safeName = att.fileName || `attachment-${idx}`;
      const dataUrl = att.dataUrl || '';
      htmlBody += `<div style="margin-bottom:12px;"><div style="font-size:13px;color:#555">${safeName}</div>`;
      if (dataUrl.startsWith('data:')) {
        htmlBody += `<img src="${dataUrl}" style="max-width:600px;max-height:400px;border:1px solid #eee;margin-top:6px;" />`;
      } else if (att.url) {
        htmlBody += `<a href="${att.url}">Download</a>`;
      }
      htmlBody += '</div>';
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Casa Studio <no-reply@casastudio.com>',
        to: ['hello@casastudio.com'],
        subject: `New consultation request - ${topic}`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      setResponseStatus(res, response.status);
      return { error: `Provider error: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    setResponseStatus(res, 500);
    return { error: 'Unable to send email. Please try again later.' };
  }
});