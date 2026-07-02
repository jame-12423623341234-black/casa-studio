import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), '.uploads');
const FILES_JSON = path.join(DATA_DIR, 'files.json');

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };
  if (!id) {
    setResponseStatus(event, 400);
    return { error: 'Missing id' };
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const filesRaw = await fs.readFile(FILES_JSON, 'utf-8');
    const files = JSON.parse(filesRaw);
    const idx = files.findIndex((f: any) => f.id === id);
    if (idx === -1) {
      setResponseStatus(event, 404);
      return { error: 'Not found' };
    }
    const entry = files[idx];
    if (entry.savedName) {
      try { await fs.unlink(path.join(DATA_DIR, entry.savedName)); } catch {}
    }
    files.splice(idx, 1);
    await fs.writeFile(FILES_JSON, JSON.stringify(files, null, 2));
    return { ok: true };
  } catch (err) {
    setResponseStatus(event, 500);
    return { error: 'Server error' };
  }
});
