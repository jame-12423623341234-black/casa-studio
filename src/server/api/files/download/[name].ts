import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), '.uploads');

export default defineEventHandler(async (event) => {
  const { name } = event.context.params as { name?: string };
  if (!name) {
    setResponseStatus(event, 400);
    return { error: 'Missing name' };
  }
  const filePath = path.join(DATA_DIR, name);
  try {
    const buf = await fs.readFile(filePath);
    setResponseHeader(event, 'content-disposition', `attachment; filename="${name.replace(/^file-[^_]+_?/, '')}"`);
    setResponseHeader(event, 'content-type', 'application/octet-stream');
    return buf;
  } catch (err) {
    setResponseStatus(event, 404);
    return { error: 'Not found' };
  }
});
