import {app,user,$,$$,create,get,patch,remove,listBy,all,recent,ICON,fmtSize,fmtDate,toast,download} from './drive-core.js';
const MODE=(window.DRIVE&&window.DRIVE.storage)==='firebase'?'firebase':'firestore',MAXF=MODE==='firebase'?25*1048576:600*1024;
let view='drive',cur=location.hash.slice(1)||'root',grid=localStorage.getItem('drv-view')!=='list',q='',sm=null;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const stor=async()=>sm||(sm=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js').then(m=>({...m,st:m.getStorage(app)})));
const b64=f=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=ko;r.readAsDataURL(f)});
const LABEL={folder:'Cartella',doc:'Documento',slides:'Presentazione',sheet:'Foglio',file:'File'};
const URLS={doc:'/drive/doc/',slides:'/drive/slides/',sheet:'/drive/sheet/'};
const NEW={doc:{n:'Documento senza titolo',x:{html:'<p><br></p>'}},slides:{n:'Presentazione senza titolo',x:{meta:{title:'Titolo della presentazione',subtitle:'Sottotitolo o occasione',author:'',date:String(new Date().getFullYear()),closing:'Grazie!',contact:''},slides:[{title:'Primo argomento',bullets:['Primo punto','Secondo punto']}]}},sheet:{n:'Foglio senza titolo',x:{cells:{},rows:50,cols:12}}};
async function load(){
 if(q){const a=await all();return a.filter(i=>!i.trashed&&i.name.toLowerCase().includes(q.toLowerCase()))}
 if(view==='trash')return listBy('trashed',true);
 if(view==='recent')return (await recent(80)).filter(i=>!i.trashed&&i.type!=='folder').slice(0,30);
 return (await listBy('parent',cur)).filter(i=>!i.trashed)}
async function crumbs(){const bar=$('#crumbs');bar.textContent='';
 const add=(t,id)=>{const b=el('button','crumb',t);b.dataset.id=id;b.onclick=()=>go(id);bar.append(b)};
 if(view!=='drive'||q){bar.append(el('span','crumb',q?'Risultati della ricerca':view==='recent'?'Recenti':'Cestino'));return}
 add('Il mio Drive','root');let id=cur,chain=[],n=0;while(id&&id!=='root'&&n++<20){const it=await get(id);if(!it)break;chain.unshift(it);id=it.parent}
 chain.forEach(it=>{bar.append(el('span','sep','›'));add(it.name,it.id)})}
function go(id){cur=id;view='drive';q='';$('#dq').value='';location.hash=id==='root'?'':id;setNav();render()}
function setNav(){$$('#dnav button').forEach(b=>b.classList.toggle('on',b.dataset.v===view))}
async function render(){
 const box=$('#dlist');box.className='dgrid'+(grid?'':' list');box.textContent='';crumbs();
 let items;try{items=await load()}catch(e){console.error(e);$('#dempty').hidden=false;$('#dempty').textContent='Errore di lettura: controlla le regole di Firestore (vedi README).';return}
 if(view==='recent'&&!q)items.sort((a,b)=>b.updated-a.updated);else items.sort((a,b)=>(a.type==='folder'?0:1)-(b.type==='folder'?0:1)||a.name.localeCompare(b.name,'it'));
 $('#dempty').hidden=items.length>0;$('#dempty').textContent=view==='trash'?'Il cestino è vuoto.':q?'Nessun risultato.':'Cartella vuota. Usa “＋ Nuovo” oppure trascina qui dei file.';
 items.forEach(it=>box.append(card(it)));usage()}
function card(it){const c=el('div','item t-'+it.type);c.tabIndex=0;c.dataset.id=it.id;c.setAttribute('role','button');
 c.append(el('div','ico',ICON[it.type]||'📄'),el('div','nm',it.name),el('div','mt',LABEL[it.type]+' · '+(it.type==='file'?fmtSize(it.size||0)+' · ':'')+fmtDate(it.updated)));
 const a=el('div','acts');const btn=(t,ti,f)=>{const b=el('button','',t);b.title=ti;b.setAttribute('aria-label',ti);b.onclick=e=>{e.stopPropagation();f()};a.append(b)};
 if(view==='trash'){btn('↩','Ripristina',async()=>{await patch(it.id,{trashed:false});render()});btn('✕','Elimina per sempre',async()=>{if(confirm('Eliminare per sempre “'+it.name+'”?')){await purge(it);render()}})}
 else{btn('✏️','Rinomina',async()=>{const n=prompt('Nuovo nome',it.name);if(n&&n.trim()){await patch(it.id,{name:n.trim()});render()}});if(it.type==='file')btn('⬇','Scarica',()=>openFile(it,true));btn('🗑','Sposta nel cestino',async()=>{await patch(it.id,{trashed:true});toast('Spostato nel cestino');render()})}
 c.append(a);
 c.onclick=()=>open(it);c.onkeydown=e=>{if(e.key==='Enter')open(it)};
 if(view==='drive'&&!q){c.draggable=true;c.ondragstart=e=>{e.dataTransfer.setData('text/x-item',it.id)};
  if(it.type==='folder'){c.ondragover=e=>{if(e.dataTransfer.types.includes('text/x-item')){e.preventDefault();c.classList.add('drop')}};c.ondragleave=()=>c.classList.remove('drop');c.ondrop=async e=>{e.preventDefault();e.stopPropagation();c.classList.remove('drop');const id=e.dataTransfer.getData('text/x-item');if(id&&id!==it.id){await patch(id,{parent:it.id});render()}}}}
 return c}
function open(it){if(view==='trash'){toast('Ripristina l’elemento per aprirlo');return}
 if(it.type==='folder')return go(it.id);if(URLS[it.type])return location.href=URLS[it.type]+'?id='+it.id;openFile(it,false)}
const blobOf=it=>{const s=atob(it.data),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return new Blob([a],{type:it.mime})};
async function openFile(it,dl){try{
 if(it.data){const b=blobOf(it);if(dl||!/^(image\/|application\/pdf|text\/)/.test(it.mime))download(b,it.name);else window.open(URL.createObjectURL(b),'_blank')}
 else if(it.path){const m=await stor(),url=await m.getDownloadURL(m.ref(m.st,it.path));if(dl||!/^(image\/|application\/pdf|text\/)/.test(it.mime||'')){const a=document.createElement('a');a.href=url;a.target='_blank';a.download=it.name;a.click()}else window.open(url,'_blank')}}catch(e){toast(storErr(e))}}
const storErr=e=>/402|403|unauthorized|billing|Blaze/i.test(e.code+e.message)?'Cloud Storage non è attivo: serve il piano Blaze di Firebase (oppure usa drive.storage: firestore).':(e.message||String(e));
async function purge(it){if(it.type==='folder')for(const c of await listBy('parent',it.id))await purge(c);
 if(it.path){try{const m=await stor();await m.deleteObject(m.ref(m.st,it.path))}catch(e){console.warn(e)}}await remove(it.id)}
async function upload(files){for(const f of files){try{
 if(f.size>MAXF)throw new Error(f.name+': supera '+fmtSize(MAXF)+(MODE==='firestore'?' (modalità gratuita: per file più grandi passa a drive.storage: firebase)':''));
 if(MODE==='firestore')await create('file',f.name,cur,{size:f.size,mime:f.type||'application/octet-stream',data:await b64(f)});
 else{const m=await stor(),u=await user,id=await create('file',f.name,cur,{size:f.size,mime:f.type||'application/octet-stream'}),path=`users/${u.uid}/files/${id}`;try{await m.uploadBytes(m.ref(m.st,path),f)}catch(e){await remove(id);throw e}await patch(id,{path})}
 toast('Caricato: '+f.name)}catch(e){toast(storErr(e))}}render()}
async function usage(){try{const f=await listBy('type','file'),t=f.filter(x=>!x.trashed).reduce((s,x)=>s+(x.size||0),0);$('#usage').textContent='File: '+fmtSize(t)+' · limite per file '+fmtSize(MAXF)}catch(e){}}
// interazioni
$('#newbtn').onclick=e=>{e.stopPropagation();$('#newmenu').hidden=!$('#newmenu').hidden};document.addEventListener('click',()=>$('#newmenu').hidden=true);
$$('#newmenu button').forEach(b=>b.onclick=async()=>{const k=b.dataset.n;$('#newmenu').hidden=true;
 if(k==='file')return $('#up').click();
 if(k==='folder'){const n=prompt('Nome della cartella','Nuova cartella');if(n&&n.trim()){await create('folder',n.trim(),cur);render()}return}
 const id=await create(k,NEW[k].n,cur,NEW[k].x);location.href=URLS[k]+'?id='+id});
$('#up').onchange=e=>{upload([...e.target.files]);e.target.value=''};
$$('#dnav button').forEach(b=>b.onclick=()=>{view=b.dataset.v;q='';$('#dq').value='';setNav();render()});
let t;$('#dq').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{q=e.target.value.trim();render()},300)};
$('#vw').onclick=()=>{grid=!grid;localStorage.setItem('drv-view',grid?'grid':'list');render()};
addEventListener('hashchange',()=>{cur=location.hash.slice(1)||'root';if(view==='drive')render()});
const dm=$('#dmain'),dz=$('#dz');
dm.ondragover=e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();dz.hidden=false}};dm.ondragleave=e=>{if(!dm.contains(e.relatedTarget))dz.hidden=true};
dm.ondrop=e=>{if(e.dataTransfer.files.length){e.preventDefault();dz.hidden=true;upload([...e.dataTransfer.files])}};
$('#crumbs').ondragover=e=>{if(e.dataTransfer.types.includes('text/x-item'))e.preventDefault()};
$('#crumbs').ondrop=async e=>{const b=e.target.closest('.crumb[data-id]'),id=e.dataTransfer.getData('text/x-item');if(b&&id&&id!==b.dataset.id){e.preventDefault();await patch(id,{parent:b.dataset.id});render()}};
await user;render();
