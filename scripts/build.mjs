import { cp, mkdir, rm, writeFile, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('site','dist',{recursive:true});
const api=process.env.PUBLIC_API_BASE?.trim() || '';
if(api){const url=new URL(api);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash)throw Error('PUBLIC_API_BASE must be an HTTPS origin');await writeFile('dist/config.js',`export const config = ${JSON.stringify({apiBase:url.origin})};\n`);await rm('dist/content.json');}
// Version every local script and stylesheet together so cached modules cannot mix releases.
const names=(await readdir('dist')).filter(name=>/\.(js|css)$/.test(name)).sort();
const contents=await Promise.all(names.map(name=>readFile(`dist/${name}`,'utf8')));
const version=createHash('sha256').update(JSON.stringify(contents)).digest('hex').slice(0,12);
const paths=new Map(names.map(name=>[name,name.replace(/\.(js|css)$/,`.${version}.$1`)]));
const rewrite=text=>[...paths].reduce((result,[from,to])=>result.replaceAll(`./${from}`,`./${to}`),text);
for(let i=0;i<names.length;i++){
  await writeFile(`dist/${paths.get(names[i])}`,rewrite(contents[i]));
  await rm(`dist/${names[i]}`);
}
await writeFile('dist/index.html',rewrite(await readFile('dist/index.html','utf8')));
await writeFile('dist/.nojekyll','');
console.log(`Built GitHub Pages site in dist/ (${api?'Cloudflare content':'CV-based preview content'}).`);
