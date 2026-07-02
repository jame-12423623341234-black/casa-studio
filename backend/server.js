import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '..', '.uploads');
const FILES_JSON = path.join(DATA_DIR, 'files.json');

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILES_JSON);
  } catch {
    await fs.writeFile(FILES_JSON, '[]');
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, service: 'backend' });
});

app.get('/api/files', async (_req, res) => {
  await ensureStorage();
  const filesRaw = await fs.readFile(FILES_JSON, 'utf-8');
  res.json({ files: JSON.parse(filesRaw) });
});

app.post('/api/files', async (req, res) => {
  await ensureStorage();
  const { name, fileName, description, size, dataUrl, mimeType } = req.body || {};
  if (!dataUrl || !fileName) {
    return res.status(400).json({ error: 'fileName and dataUrl required' });
  }

  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
  if (!match) {
    return res.status(400).json({ error: 'Invalid dataUrl' });
  }

  const [, detectedMime, b64] = match;
  const buffer = Buffer.from(b64, 'base64');
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const savedName = `${id}-${fileName}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = path.join(DATA_DIR, savedName);
  await fs.writeFile(filePath, buffer);

  const filesRaw = await fs.readFile(FILES_JSON, 'utf-8');
  const files = JSON.parse(filesRaw);
  const meta = {
    id,
    name: name || fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    description: description || 'Uploaded file',
    size: size || `${Math.round(buffer.length / 1024)} KB`,
    uploadedAt: new Date().toISOString(),
    downloadCount: 0,
    dataPath: `/api/files/download/${savedName}`,
    mimeType: mimeType || detectedMime,
    fileName,
    savedName,
  };

  files.push(meta);
  await fs.writeFile(FILES_JSON, JSON.stringify(files, null, 2));
  res.json({ file: meta });
});

app.delete('/api/files/:id', async (req, res) => {
  await ensureStorage();
  const id = req.params.id;
  const filesRaw = await fs.readFile(FILES_JSON, 'utf-8');
  const files = JSON.parse(filesRaw);
  const idx = files.findIndex((f) => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Not found' });
  }

  const entry = files[idx];
  if (entry.savedName) {
    try {
      await fs.unlink(path.join(DATA_DIR, entry.savedName));
    } catch {
      // ignore missing files
    }
  }

  files.splice(idx, 1);
  await fs.writeFile(FILES_JSON, JSON.stringify(files, null, 2));
  res.json({ ok: true });
});

app.get('/api/files/download/:name', async (req, res) => {
  const name = req.params.name;
  const filePath = path.join(DATA_DIR, name);
  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, topic, message, attachments } = req.body || {};
  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Email provider not configured. Set RESEND_API_KEY in your environment.' });
  }

  const textBody = `New consultation request from ${name} <${email}>:\n\nTopic: ${topic}\n\nMessage:\n${message}`;
  let htmlBody = `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Topic:</strong> ${topic}</p><p>${message.replace(/\n/g, '<br/>')}</p>`;

  if (Array.isArray(attachments) && attachments.length > 0) {
    htmlBody += '<hr/><p><strong>Attachments:</strong></p>';
    attachments.forEach((att, idx) => {
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
      return res.status(response.status).json({ error: `Provider error: ${errorText}` });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Unable to send email. Please try again later.' });
  }
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;
app.listen(PORT, () => console.log(`Backend API running at http://localhost:${PORT}`));
