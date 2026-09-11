import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('site','dist',{recursive:true});
const api=process.env.PUBLIC_API_BASE?.trim() || '';
if(api){const url=new URL(api);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash)throw Error('PUBLIC_API_BASE must be an HTTPS origin');await writeFile('dist/config.js',`export const config = ${JSON.stringify({apiBase:url.origin})};\n`);await rm('dist/content.json');}
await writeFile('dist/.nojekyll','');
console.log(`Built GitHub Pages site in dist/ (${api?'Cloudflare content':'CV-based preview content'}).`);
