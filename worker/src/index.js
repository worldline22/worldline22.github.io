const json = (data,status=200,headers={}) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const cookie = (name,value,age) => `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const cookies = request => Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(p=>p.trim().split('=')));
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
export const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');
const redirect = (to,setCookies=[]) => {const headers=new Headers({'Location':to,'Cache-Control':'no-store'});setCookies.forEach(c=>headers.append('Set-Cookie',c));return new Response(null,{status:302,headers});};
const now = () => Math.floor(Date.now()/1000);
export async function isOwner(request,env){
  const token=cookies(request)['__Host-yq_session'];
  if(!token||!/^[a-f0-9]{64}$/.test(token))return false;
  const session=await env.DB.prepare('SELECT expires_at FROM sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token),now()).first();
  return Boolean(session);
}
export function validateEntry(input,id){
  if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id))throw Error('Use a short URL ID with lowercase letters, numbers, and hyphens.');
  if(!['project','paper','note'].includes(input.kind))throw Error('Choose project, paper, or note.');
  if(!['public','private'].includes(input.visibility))throw Error('Choose public or private.');
  const out={id,kind:input.kind,visibility:input.visibility};
  for(const [key,max] of Object.entries({title:200,authors:2000,summary:1000,body:60000,category:100,status:100,date:100,organization:200,url:2000})){
    if(input[key]!=null&&typeof input[key]!=='string')throw Error(`Invalid ${key}.`);
    out[key]=(input[key]||'').trim();if(out[key].length>max)throw Error(`${key} is too long.`);
  }
  if(!out.title)throw Error('A title is required.');
  if(out.url){const url=new URL(out.url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Resource links must use HTTPS without credentials.');}
  out.position=Number.isInteger(input.position)&&Math.abs(input.position)<100000?input.position:0;
  out.archived=input.archived===1?1:0;
  out.updated_at=new Date().toISOString();return out;
}
export async function handle(request,env,fetcher=fetch){
  const url=new URL(request.url),path=url.pathname;
  // Public read surface: only explicitly public, non-archived records leave D1.
  if(path==='/api/public/content'){
    const publicOrigin=new URL(env.PUBLIC_SITE_URL).origin;
    const cors={'Access-Control-Allow-Origin':publicOrigin,'Vary':'Origin'};
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET'}});
    if(request.method!=='GET')return json({error:'Method not allowed'},405,cors);
    const {results}=await env.DB.prepare("SELECT id,kind,title,authors,summary,body,category,status,date,organization,url,visibility,updated_at FROM entries WHERE visibility = 'public' AND archived = 0 ORDER BY position ASC, updated_at DESC").all();
    return json({projects:results.filter(x=>x.kind==='project'),papers:results.filter(x=>x.kind==='paper'),notes:results.filter(x=>x.kind==='note')},200,cors);
  }
  if(path==='/auth/login' && request.method==='GET'){
    if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.OWNER_GITHUB_ID)return json({error:'GitHub sign-in has not been configured yet.'},503);
    const state=random(),verifier=random();
    await env.DB.batch([env.DB.prepare('DELETE FROM oauth_states WHERE expires_at < ?').bind(now()),env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),env.DB.prepare('INSERT INTO oauth_states(state_hash,verifier,expires_at) VALUES(?,?,?)').bind(await hash(state),verifier,now()+600)]);
    const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
    const challenge=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const auth=new URL('https://github.com/login/oauth/authorize');
    auth.search=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:url.origin+'/auth/callback',state,code_challenge:challenge,code_challenge_method:'S256',login:'worldline22'}).toString();
    return redirect(auth.href,[cookie('__Host-yq_oauth',state,600)]);
  }
  if(path==='/auth/callback' && request.method==='GET'){
    const state=url.searchParams.get('state'),code=url.searchParams.get('code');
    if(!state||!code||state!==cookies(request)['__Host-yq_oauth'])return json({error:'Sign-in expired or could not be verified. Start again at /auth/login.'},400);
    const saved=await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash = ? AND expires_at > ? RETURNING verifier').bind(await hash(state),now()).first();
    if(!saved)return json({error:'This sign-in link expired or was already used.'},400);
    const exchanged=await fetcher('https://github.com/login/oauth/access_token',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:url.origin+'/auth/callback',code_verifier:saved.verifier})});
    if(!exchanged.ok)return json({error:'GitHub sign-in is temporarily unavailable.'},502);
    const token=await exchanged.json();if(!token.access_token)return json({error:'GitHub could not complete sign-in. Please try again.'},401);
    const profile=await fetcher('https://api.github.com/user',{headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'Yuchao-academic-workspace'}});
    if(!profile.ok)return json({error:'Could not verify your GitHub account.'},502);
    const user=await profile.json();
    // Numeric ID remains stable when the GitHub login changes. The OAuth token is not retained.
    if(!env.OWNER_GITHUB_ID||String(user.id)!==env.OWNER_GITHUB_ID)return json({error:'This workspace is only available to its owner.'},403,{'Set-Cookie':cookie('__Host-yq_oauth','',0)});
    const session=random();await env.DB.prepare('INSERT INTO sessions(token_hash,expires_at) VALUES(?,?)').bind(await hash(session),now()+604800).run();
    return redirect('/studio',[cookie('__Host-yq_session',session,604800),cookie('__Host-yq_oauth','',0)]);
  }
  if(path.startsWith('/api/admin/') || path==='/auth/logout'){
    if(!await isOwner(request,env))return json({error:'Sign in to your private workspace.'},401);
    if(!['GET','HEAD'].includes(request.method)&&request.headers.get('Origin')!==url.origin)return json({error:'Request origin was not verified.'},403);
    if(path==='/auth/logout'&&request.method==='POST'){
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hash(cookies(request)['__Host-yq_session'])).run();
      return json({ok:true},200,{'Set-Cookie':cookie('__Host-yq_session','',0)});
    }
    if(path==='/api/admin/items'&&request.method==='GET'){
      const {results}=await env.DB.prepare('SELECT * FROM entries ORDER BY position ASC, updated_at DESC').all();return json({items:results,publicSiteUrl:env.PUBLIC_SITE_URL});
    }
    if(path.startsWith('/api/admin/items/')&&request.method==='PUT'){
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Send JSON content.'},415);
      // Bound the actual body, including chunked requests.
      const reader=request.body?.getReader();if(!reader)return json({error:'Missing content.'},400);
      const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>100000){await reader.cancel();return json({error:'Entry is too large.'},413);}chunks.push(value);}
      const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
      let item;try{item=validateEntry(JSON.parse(new TextDecoder().decode(body)),decodeURIComponent(path.slice('/api/admin/items/'.length)));}catch(error){return json({error:error.message},400);}
      const keys=Object.keys(item);
      await env.DB.prepare(`INSERT INTO entries (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${keys.filter(k=>k!=='id').map(k=>`${k}=excluded.${k}`).join(',')}`).bind(...keys.map(k=>item[k])).run();
      return json({item});
    }
    return json({error:'Not found'},404);
  }
  if(path==='/'||path==='/studio'||path==='/studio/'){
    if(!await isOwner(request,env))return redirect('/auth/login');
    const asset=await env.ASSETS.fetch(new Request(new URL('/studio.html',url),request));
    return secureAsset(asset);
  }
  // Never serve the HTML via an unguarded alternate URL.
  if(path==='/studio.html')return new Response('Not found',{status:404});
  if(['/studio.js','/studio.css','/theme.js','/style.css','/favicon.svg'].includes(path))return secureAsset(await env.ASSETS.fetch(request));
  return json({error:'Not found'},404);
}
function secureAsset(asset){const headers=new Headers(asset.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');headers.set('Content-Security-Policy',"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");return new Response(asset.body,{status:asset.status,headers});}
export default {async fetch(request,env){try{return await handle(request,env);}catch(error){console.error('Workspace request failed:',error.name);return json({error:'The workspace is temporarily unavailable. Please try again.'},503);}}};
