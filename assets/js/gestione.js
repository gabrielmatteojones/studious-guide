(function(){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const G=$('#gest'),cfg=G.dataset;let user=null;
 const say=(id,t,ok)=>{const m=$(id);m.hidden=!t;m.textContent=t||'';m.className='msg'+(ok?' ok':'')};
 const isAdmin=u=>!!(u&&u.app_metadata&&(u.app_metadata.roles||[]).includes('admin'));
 if(typeof netlifyIdentity==='undefined'){say('#gerr','Impossibile caricare Netlify Identity (identity.netlify.com). Disattiva eventuali blocchi di contenuti e ricarica la pagina.');$('#glogin').disabled=true;return}
 async function api(body){const t=await user.jwt(true);const r=await fetch('/.netlify/functions/publish',{method:'POST',headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||d.message||('Errore '+r.status));return d}
 function render(u){user=u;const ok=isAdmin(u);$('#panel').hidden=!ok;$('#gate').hidden=ok;$('#glogin').textContent=u?'Cambia account':'Accedi';
  $('#gwho').textContent=!u?'Accedi con il tuo account Netlify Identity.':ok?('Connesso come '+u.email):('Sei connesso come '+u.email+', ma manca il ruolo admin. Assegnalo da Netlify → Identity → utente → Roles, poi esci e rientra.');
  if(ok){say('#gerr','');loadList()}}
 netlifyIdentity.on('init',render);
 netlifyIdentity.on('login',u=>{render(u);netlifyIdentity.close()});
 netlifyIdentity.on('logout',()=>render(null));
 netlifyIdentity.on('error',e=>say('#gerr','Errore Netlify Identity: '+(e&&e.message||e)+'. Controlla che Identity sia attivo (Site configuration → Identity → Enable) e di aprire il sito dal suo dominio Netlify.'));
 netlifyIdentity.init(cfg.idurl?{APIUrl:cfg.idurl}:undefined);
 $('#glogin').onclick=()=>{if(user)netlifyIdentity.logout();else netlifyIdentity.open('login')};
 $('#glogout').onclick=()=>netlifyIdentity.logout();
 $$('#gtabs .chip[data-p]').forEach(c=>c.onclick=()=>{$$('#gtabs .chip[data-p]').forEach(x=>x.classList.toggle('on',x===c));['cms','pdf','ppt'].forEach(k=>$('#p-'+k).hidden=c.dataset.p!==k)});
 const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 const today=()=>new Date().toISOString().slice(0,10),q=v=>JSON.stringify(v);
 const b64=f=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=ko;r.readAsDataURL(f)});

 /* ---------- CMS ---------- */
 function fields(){const t=$('#ctype').value;$$('#cform [data-for]').forEach(l=>l.hidden=!l.dataset.for.split(' ').includes(t))}
 function reset(){$('#cform').reset();$('#cpath').value='';$('#cdate').value=today();$('#cord').value=1;say('#cmsg','');fields()}
 async function loadList(){const ul=$('#clist');ul.innerHTML='<li>Caricamento…</li>';try{const d=await api({action:'list',dir:$('#ctype').value});ul.innerHTML=d.items.length?'':'<li>Nessun elemento.</li>';d.items.forEach(i=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=i.name;b.onclick=()=>edit(i.path);li.append(b);ul.append(li)})}catch(e){ul.innerHTML='<li>'+e.message+'</li>'}}
 function parse(md){const m=md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);const o={_body:m?m[2].trim():md};if(m)m[1].split('\n').forEach(l=>{const i=l.indexOf(':');if(i<1)return;const k=l.slice(0,i).trim();let v=l.slice(i+1).trim();try{v=JSON.parse(v)}catch(e){}o[k]=v});return o}
 async function edit(path){try{const d=await api({action:'get',path}),o=parse(d.content),n=path.split('/').pop().replace('.md','');
  $('#cpath').value=path;$('#ctitle').value=o.title||'';$('#cdate').value=String(o.date||n.slice(0,10)).slice(0,10);$('#ccat').value=o.category||'';$('#clab').value=o.label||'';$('#ccats').value=o.cats||'';$('#clink').value=o.link||'';$('#cres').checked=o.reserved===true;$('#cproj').value=o.project||'';$('#cord').value=o.order||1;$('#csum').value=o.summary||o.description||'';$('#cbody').value=o._body;say('#cmsg','Modifica di '+path,true)}catch(e){say('#cmsg',e.message)}}
 $('#ctype').onchange=()=>{reset();loadList()};$('#cnew').onclick=reset;
 $('#cform').onsubmit=async e=>{e.preventDefault();const t=$('#ctype').value,title=$('#ctitle').value.trim(),date=$('#cdate').value,s=slug(title);
  let path=$('#cpath').value||(t==='_posts'?`_posts/${date}-${s}.md`:t==='_guides'?`_guides/${slug($('#cproj').value||'generale')}/${String($('#cord').value||1).padStart(2,'0')}-${s}.md`:`${t}/${s}.md`);
  let link=$('#clink').value,fmt='';
  try{say('#cmsg','Pubblicazione in corso…',true);
   if(t==='_documents'&&$('#cfile').files[0]){const f=$('#cfile').files[0],ext=(f.name.split('.').pop()||'pdf').toLowerCase().replace('jpeg','jpg');if(f.size>3e6)throw new Error('File troppo grande (max 3 MB).');const fp=`assets/documents/${s}.${ext}`;await api({action:'save',path:fp,content:await b64(f),encoding:'base64'});link='/'+fp;fmt=ext.toUpperCase()}
   const fm=[`title: ${q(title)}`];
   if(t!=='_posts')fm.push(`date: ${date}`);
   if(t==='_posts'&&$('#ccat').value)fm.push(`category: ${q($('#ccat').value)}`);
   if(t==='_portfolio')fm.push(`label: ${q($('#clab').value)}`,`cats: ${q($('#ccats').value)}`);
   if(t==='_guides')fm.push(`project: ${q($('#cproj').value||'Generale')}`,`order: ${+$('#cord').value||1}`,`summary: ${q($('#csum').value)}`);
   if(t==='_documents'){fm.push(`description: ${q($('#csum').value)}`,`reserved: ${$('#cres').checked}`);if(fmt)fm.push(`format: ${q(fmt)}`)}
   if(link&&t!=='_posts'&&t!=='_guides')fm.push(`link: ${q(link)}`);
   await api({action:'save',path,content:'---\n'+fm.join('\n')+'\n---\n'+$('#cbody').value.trim()+'\n'});
   say('#cmsg','Salvato! Netlify sta ricostruendo il sito (1–2 minuti).',true);$('#cpath').value=path;loadList()}catch(x){say('#cmsg',x.message)}};
 $('#cdel').onclick=async()=>{const p=$('#cpath').value;if(!p||!confirm('Eliminare '+p+'?'))return;try{await api({action:'delete',path:p});reset();say('#cmsg','Eliminato.',true);loadList()}catch(x){say('#cmsg',x.message)}};
 reset();

 /* ---------- PDF con carta intestata ---------- */
 const PRE={lettera:{s:'Oggetto della lettera',b:'Gentile [Nome],\n\nscrivo per…\n\nCordiali saluti.'},
  attestato:{s:'Attestato di partecipazione',b:'Si attesta che [Nome e Cognome] ha partecipato al [laboratorio / corso / attività] svolto il [data], per una durata di [ore] ore.\n\nIl presente attestato viene rilasciato per gli usi consentiti dalla legge.'},
  preventivo:{s:'Preventivo n. [numero]',b:'Con la presente si propone il seguente preventivo:\n\n- [Voce 1]: € [importo]\n- [Voce 2]: € [importo]\n\nTotale: € [importo]\n\nValidità dell’offerta: 30 giorni. Modalità di pagamento: [indicare].'}};
 $('#dtype').onchange=()=>{const p=PRE[$('#dtype').value];$('#dsub').value=p.s;$('#dbody').value=p.b};$('#dtype').onchange();
 const longDate=()=>new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});
 $('#dwhen').value=longDate();$('#pdate').value=String(new Date().getFullYear());
 let bg;async function letterhead(){if(bg)return bg;const im=new Image();im.src=cfg.lh;await im.decode();const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);return bg=c.toDataURL('image/png')}
 async function build(){const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4'}),img=await letterhead();
  const W=210,H=297,L=+cfg.left,R=+cfg.right,T=+cfg.top,B=+cfg.bottom,mw=W-L-R,lh=5.6;
  const foot=()=>{doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(106,84,91);doc.text([cfg.addr,cfg.mail,cfg.piva].filter(Boolean).join('  ·  '),W/2,H-27,{align:'center',maxWidth:mw});doc.setTextColor(0,0,0)};
  const page=()=>{doc.addImage(img,'PNG',0,0,W,H);foot()};page();let y=T;
  const put=(txt,o={})=>{doc.setFont('helvetica',o.bold?'bold':'normal');doc.setFontSize(o.size||11);doc.rows=doc.splitTextToSize(txt||' ',mw-(o.indent||0));doc.rows.forEach(r=>{if(y>H-B){doc.addPage();page();y=T}doc.text(r,o.right?W-R:L+(o.indent||0),y,o.right?{align:'right'}:undefined);y+=lh})};
  put($('#dwhen').value,{right:true});y+=4;
  $('#dto').value.split('\n').forEach(l=>put(l,{indent:90}));y+=6;
  put($('#dsub').value,{bold:true,size:12});y+=3;
  $('#dbody').value.split('\n').forEach(l=>put(l));y+=10;
  if(y>H-B-20){doc.addPage();page();y=T}put($('#dsign').value,{right:true});return doc}
 const dmsg=(t,ok)=>say('#dmsg',t,ok);
 async function archive(path,content,title,fmt,reserved,desc){await api({action:'save',path,content,encoding:'base64'});const s=path.split('/').pop().replace(/\.[a-z]+$/,'');
  await api({action:'save',path:`_documents/${s}.md`,content:`---\ntitle: ${q(title)}\ndate: ${today()}\ndescription: ${q(desc)}\nformat: ${q(fmt)}\nlink: ${q('/'+path)}\nreserved: ${reserved}\n---\n`})}
 $('#dform').onsubmit=async e=>{e.preventDefault();try{dmsg('');const d=await build();$('#dprev').src=d.output('bloburl')}catch(x){dmsg('Errore: '+x.message)}};
 $('#ddl').onclick=async()=>{try{const d=await build();d.save(slug($('#dsub').value||'documento')+'.pdf')}catch(x){dmsg('Errore: '+x.message)}};
 $('#dsave').onclick=async()=>{try{const d=await build(),title=$('#dsub').value.trim();dmsg('Salvataggio in corso…',true);
  await archive(`assets/documents/${slug(title)}-${today()}.pdf`,d.output('datauristring').split(',')[1],title,'PDF',$('#dres').checked,'Documento su carta intestata del '+longDate()+'.');dmsg('Documento archiviato: avrà una sua pagina dopo la ricostruzione del sito.',true)}catch(x){dmsg(x.message)}};

 /* ---------- Presentazioni PPTX ---------- */
 const pdata=()=>({title:$('#ptitle').value,subtitle:$('#psub').value,author:$('#pauth').value,date:$('#pdate').value,closing:$('#pend').value,contact:$('#pcont').value,slides:parseSlides($('#pbody').value)});
 const pm=(t,ok)=>say('#pmsg',t,ok);
 $('#pform').onsubmit=async e=>{e.preventDefault();try{pm('Creo la presentazione…',true);await buildDeck(PptxGenJS,pdata()).writeFile({fileName:slug($('#ptitle').value||'presentazione')+'.pptx'});pm('Presentazione scaricata.',true)}catch(x){pm('Errore: '+x.message)}};
 $('#psave').onclick=async()=>{try{pm('Salvataggio in corso…',true);const t=$('#ptitle').value.trim(),c=await buildDeck(PptxGenJS,pdata()).write({outputType:'base64'});
  await archive(`assets/documents/${slug(t)}-${today()}.pptx`,c,t,'PPTX',false,'Presentazione con il modello del sito.');pm('Archiviata: avrà una sua pagina dopo la ricostruzione del sito.',true)}catch(x){pm(x.message)}};
})();
