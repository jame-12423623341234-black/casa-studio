import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), '.uploads');
const FILES_JSON = path.join(DATA_DIR, 'files.json');

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILES_JSON);
  } catch {
    await fs.writeFile(FILES_JSON, JSON.stringify([]));
  }
}

export default defineEventHandler(async (event) => {
  const { req, res } = event.node as any;
  await ensureStorage();

  if (req.method === 'GET') {
    const filesRaw = await fs.readFile(FILES_JSON, 'utf-8');
    const files = JSON.parse(filesRaw);
    return { files };
  }

  if (req.method === 'POST') {
    const body = await readBody(event);
    const { name, fileName, description, size, dataUrl, mimeType } = body || {};
    if (!dataUrl || !fileName) {
      setResponseStatus(res, 400);
      return { error: 'fileName and dataUrl required' };
    }

    // dataUrl format: data:<mime>;base64,<base64data>
    const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
    if (!match) {
      setResponseStatus(res, 400);
      return { error: 'Invalid dataUrl' };
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

    return { file: meta };
  }

  // DELETE all (not used)
  setResponseStatus(res, 405);
  return { error: 'Method not allowed' };
});

// download handler file
export const download = defineEventHandler(async (event) => {
  const { req, res } = event.node as any;
  const url = req.url || '';
  const parts = url.split('/');
  const savedName = parts[parts.length - 1];
  const filePath = path.join(DATA_DIR, savedName);
  try {
    const stat = await fs.stat(filePath);
    const stream = await fs.readFile(filePath);
    res.setHeader('content-length', String(stat.size));
    // content-type will be inferred by client, but we can set octet-stream
    res.setHeader('content-type', 'application/octet-stream');
    res.setHeader('content-disposition', `attachment; filename="${savedName.replace(/^file-[^_]+_?/, '')}"`);
    return stream;
  } catch (err) {
    setResponseStatus(res, 404);
    return { error: 'Not found' };
  }
});
