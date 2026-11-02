// Servidor estático mínimo para la vista previa. Uso: npm run preview  →  http://localhost:4173
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };
export function servir(puerto = Number(process.env.PORT) || 4173) {
  const srv = createServer(async (req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = normalize(join(raiz, ruta));
    if (!archivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
    try {
      const cuerpo = await readFile(archivo);
      res.writeHead(200, { 'Content-Type': tipos[extname(archivo)] || 'application/octet-stream' }).end(cuerpo);
    } catch { res.writeHead(404).end('No encontrado'); }
  });
  return new Promise((ok) => srv.listen(puerto, () => ok(srv)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  servir().then((s) => console.log(`Vista previa en http://localhost:${s.address().port}`));
}
