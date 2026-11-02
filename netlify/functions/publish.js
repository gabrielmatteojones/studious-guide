// CMS di Gabriel Jones: legge/scrive i file Jekyll nel repository GitHub. Solo utenti Netlify Identity con ruolo "admin".
// Variabili d'ambiente (Netlify → Site configuration → Environment variables): GITHUB_TOKEN, GITHUB_REPO (es. "gabriel/sito"), GITHUB_BRANCH (default "main")
const OK_MD=/^((_posts|_news|_portfolio|_documents)\/[a-z0-9][a-z0-9-]*|_guides\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*)\.md$/;
const OK_PDF=/^assets\/documents\/[a-z0-9][a-z0-9-]*\.(pdf|pptx|docx|xlsx|png|jpg|txt)$/;
const DIRS=['_posts','_news','_portfolio','_documents','_guides'];
const json=(s,b)=>({statusCode:s,headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
exports.handler=async(event,context)=>{
 const u=context.clientContext&&context.clientContext.user;
 const roles=(u&&u.app_metadata&&u.app_metadata.roles)||[];
 if(!u||!roles.includes('admin'))return json(403,{error:'Accesso negato: serve il ruolo admin.'});
 if(event.httpMethod!=='POST')return json(405,{error:'Metodo non consentito'});
 const {GITHUB_TOKEN:T,GITHUB_REPO:R,GITHUB_BRANCH:B='main'}=process.env;
 if(!T||!R)return json(500,{error:'Mancano GITHUB_TOKEN o GITHUB_REPO nelle variabili d’ambiente.'});
 let b;try{b=JSON.parse(event.body||'{}')}catch(e){return json(400,{error:'JSON non valido'})}
 const api=(p,o={})=>fetch('https://api.github.com/repos/'+R+'/contents/'+p+(o.method&&o.method!=='GET'?'':'?ref='+B),{...o,headers:{Authorization:'Bearer '+T,Accept:'application/vnd.github+json','User-Agent':'gj-cms',...(o.headers||{})}});
 try{
  if(b.action==='list'){
   if(!DIRS.includes(b.dir))return json(400,{error:'Cartella non valida'});
   const t=await fetch('https://api.github.com/repos/'+R+'/git/trees/'+B+'?recursive=1',{headers:{Authorization:'Bearer '+T,Accept:'application/vnd.github+json','User-Agent':'gj-cms'}});
   if(!t.ok)return json(200,{items:[]});const d=await t.json();
   return json(200,{items:(d.tree||[]).filter(f=>f.type==='blob'&&f.path.startsWith(b.dir+'/')&&f.path.endsWith('.md')).map(f=>({name:f.path.slice(b.dir.length+1),path:f.path}))});
  }
  if(b.action==='get'){
   if(!OK_MD.test(b.path))return json(400,{error:'Percorso non valido'});
   const r=await api(b.path);if(!r.ok)return json(r.status,{error:'File non trovato'});
   const d=await r.json();return json(200,{content:Buffer.from(d.content,'base64').toString('utf8')});
  }
  if(b.action==='save'||b.action==='delete'){
   const ok=OK_MD.test(b.path)||OK_PDF.test(b.path);if(!ok)return json(400,{error:'Percorso non consentito'});
   const ex=await api(b.path);const sha=ex.ok?(await ex.json()).sha:undefined;
   if(b.action==='delete'){
    if(!sha)return json(404,{error:'File inesistente'});
    const r=await api(b.path,{method:'DELETE',body:JSON.stringify({message:'CMS: elimina '+b.path,sha,branch:B})});
    return json(r.status,await r.json());
   }
   const content=b.encoding==='base64'?b.content:Buffer.from(String(b.content),'utf8').toString('base64');
   if(content.length>4e6)return json(413,{error:'File troppo grande'});
   const r=await api(b.path,{method:'PUT',body:JSON.stringify({message:'CMS: '+(sha?'aggiorna ':'crea ')+b.path+' ('+u.email+')',content,sha,branch:B})});
   const d=await r.json();return json(r.status,{ok:r.ok,message:d.message});
  }
  return json(400,{error:'Azione sconosciuta'});
 }catch(e){return json(500,{error:String(e.message||e)})}
};
