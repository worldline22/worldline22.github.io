import { cp, readFile, writeFile } from 'node:fs/promises';
for(const file of ['style.css','theme.js','favicon.svg'])await cp(`site/${file}`,`worker/public/${file}`);
const data=JSON.parse(await readFile('site/content.json','utf8'));
const quote=x=>`'${String(x??'').replaceAll("'","''")}'`;
const statements=["-- Public CV-derived seed only. Does not overwrite existing edits."];
for(const [kind,rows]of [['project',data.projects],['paper',data.papers],['note',data.notes]])for(const [position,row]of rows.entries()){
  if(row.visibility!=='public')throw Error('Never seed private content from a public repository.');
  const item={id:row.id,kind,title:row.title,authors:row.authors,summary:row.summary,body:row.body,category:row.category,status:row.status,date:row.date,organization:row.organization,url:row.url,visibility:'public',position,updated_at:'2026-09-11T00:00:00.000Z'};
  statements.push(`INSERT OR IGNORE INTO entries (${Object.keys(item).join(',')}) VALUES (${Object.values(item).map(quote).join(',')});`);
}
await writeFile('worker/seed.sql',statements.join('\n')+'\n');
console.log('Prepared workspace assets and public-only database seed.');
