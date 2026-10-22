// A dev server for exports: no HMR, no file watching (edits elsewhere never reload the page mid-export).
import { createServer } from 'vite';
const port = Number(process.argv[2] || 8094);
const server = await createServer({ root: process.cwd(), server: { port, strictPort: true, hmr: false, watch: null } });
await server.listen();
console.log('ready', port);
