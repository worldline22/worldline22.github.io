import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access, cp, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { papers } from '../scripts/library-content.mjs';

const root=resolve(import.meta.dirname,'..');
async function files(directory) {
  const result=[];
  for(const item of await readdir(directory,{withFileTypes:true})) {
    const path=join(directory,item.name);
    if(item.isDirectory())result.push(...await files(path));else result.push(path);
  }
  return result;
}

// Check real destinations, including fragment targets and nested relative paths.
async function checkLinks(documents) {
  for(const file of documents) {
    const html=await readFile(file,'utf8');
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${file}`);
    for(const [,href] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if(/^[a-z]+:/i.test(href)||href.startsWith('//'))continue;
      const [path,fragment]=href.split('#');
      const destination=path?resolve(dirname(file),path.split('?')[0]):file;
      await access(destination).catch(()=>assert.fail(`Missing ${href} from ${file}`));
      if(fragment&&!fragment.startsWith('/')&&destination.endsWith('.html')) {
        const target=await readFile(destination,'utf8');
        assert(target.includes(`id="${fragment}"`),`Missing fragment ${href} from ${file}`);
      }
    }
  }
}

test('Library pages have working local navigation, unique IDs, and public paper sources',async()=>{
  const entries=await files(join(root,'site/library'));
  const documents=entries.filter(file=>file.endsWith('.html'));
  assert.equal(documents.length,papers.length+3);
  assert.equal(entries.filter(file=>file.endsWith('.pdf')).length,0);
  await checkLinks(documents);
  for(const paper of papers) {
    const html=await readFile(join(root,`site/library/torch-helion/${paper.id}.html`),'utf8');
    for(const url of [paper.sourceUrl,paper.pdfUrl]) {
      assert.equal(new URL(url).protocol,'https:');
      assert(['arxiv.org','www.usenix.org','doi.org','dl.acm.org'].includes(new URL(url).hostname));
      assert(html.includes(`href="${url}"`),`Missing public source in ${paper.name}`);
    }
    assert(!html.includes('../pdfs/'));
    assert(!html.includes('undefined'), `Incomplete explainer: ${paper.name}`);
    assert(!html.includes('/Users/')&&!html.includes('/home/'));
  }
});

test('production build preserves nested Library assets when private content API is configured',async()=>{
  const workspace=await mkdtemp(join(tmpdir(),'yq-library-build-'));
  try {
    await cp(join(root,'site'),join(workspace,'site'),{recursive:true});
    execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{
      cwd:workspace,env:{...process.env,PUBLIC_API_BASE:'https://content.example.test'},stdio:'pipe'
    });
    const dist=join(workspace,'dist');
    await assert.rejects(access(join(dist,'content.json')));
    const documents=(await files(join(dist,'library'))).filter(file=>file.endsWith('.html'));
    await checkLinks(documents);
    for(const file of documents) {
      const html=await readFile(file,'utf8');
      assert.match(html,/library\.[a-f0-9]{12}\.js/);
      assert.match(html,/library\.[a-f0-9]{12}\.css/);
      assert.match(html,/theme\.[a-f0-9]{12}\.js/);
      assert(!html.includes('app.js'),'Library must not require the public content API');
    }
  } finally { await rm(workspace,{recursive:true,force:true}); }
});
