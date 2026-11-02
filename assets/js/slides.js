import {$,$$,patch,toast,saver,openItem,slug} from './drive-core.js';
const it=await openItem('slides');if(!it)throw 0;
const D={meta:{title:'',subtitle:'',author:'',date:'',closing:'Grazie!',contact:'',...(it.meta||{})},slides:(it.slides&&it.slides.length?it.slides:[{title:'Nuova slide',bullets:[]}]).map(s=>({title:s.title||'',bullets:[...(s.bullets||[])]}))};
let idx=-1;const n=()=>D.slides.length;
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const save=saver(()=>patch(it.id,{meta:D.meta,slides:D.slides,name:$('#title').value.trim()||'Presentazione senza titolo'}));
$('#title').addEventListener('input',save);
function paint(box,i){box.textContent='';const m=D.meta;box.classList.remove('cover','closing','content');
 if(i<0){box.classList.add('cover');box.append(h('div','cvdots'),h('h2','',m.title||'Titolo'),h('p','',m.subtitle),h('small','',[m.author,m.date].filter(Boolean).join(' · ')))}
 else if(i>=n()){box.classList.add('closing');box.append(h('h2','',m.closing||'Grazie!'),h('p','',m.contact))}
 else{box.classList.add('content');const s=D.slides[i];box.append(h('div','band'),h('h3','',s.title||'Titolo'));const ul=h('ul');(s.bullets||[]).forEach(b=>ul.append(h('li','',b)));box.append(ul)}}
function thumbs(){const t=$('#thumbs');t.textContent='';for(let i=-1;i<=n();i++){const b=h('button','th'+(i===idx?' on':''));b.type='button';const st=h('div','stage mini');paint(st,i);b.append(h('span','num',i<0?'◆':i>=n()?'■':String(i+1)),st);b.onclick=()=>{idx=i;draw()};t.append(b)}}
function field(lbl,val,fn,area){const l=h('label','',lbl),i=h(area?'textarea':'input');if(area)i.rows=7;i.value=val||'';i.oninput=()=>{fn(i.value);paint($('#stage'),idx);thumbs();save()};l.append(i);return l}
function form(){const f=$('#sform');f.textContent='';const m=D.meta;
 if(idx<0){f.append(field('Titolo',m.title,v=>m.title=v),field('Sottotitolo',m.subtitle,v=>m.subtitle=v),field('Autore',m.author,v=>m.author=v),field('Data',m.date,v=>m.date=v))}
 else if(idx>=n()){f.append(field('Frase finale',m.closing,v=>m.closing=v),field('Contatti',m.contact,v=>m.contact=v))}
 else{const s=D.slides[idx];f.append(field('Titolo della slide',s.title,v=>s.title=v),field('Punti elenco (uno per riga)',s.bullets.join('\n'),v=>s.bullets=v.split('\n').map(x=>x.trim()).filter(Boolean),true))}}
function draw(){paint($('#stage'),idx);thumbs();form()}
const inside=()=>idx>=0&&idx<n();
$('#sadd').onclick=()=>{const at=inside()?idx+1:n();D.slides.splice(at,0,{title:'Nuova slide',bullets:[]});idx=at;draw();save()};
$('#sdup').onclick=()=>{if(!inside())return toast('Seleziona una slide di contenuto');const c=JSON.parse(JSON.stringify(D.slides[idx]));D.slides.splice(idx+1,0,c);idx++;draw();save()};
$('#sdel').onclick=()=>{if(!inside())return toast('Copertina e chiusura non si eliminano');if(n()===1)return toast('Serve almeno una slide');D.slides.splice(idx,1);idx=Math.min(idx,n()-1);draw();save()};
$('#sup').onclick=()=>{if(inside()&&idx>0){[D.slides[idx-1],D.slides[idx]]=[D.slides[idx],D.slides[idx-1]];idx--;draw();save()}};
$('#sdn').onclick=()=>{if(inside()&&idx<n()-1){[D.slides[idx+1],D.slides[idx]]=[D.slides[idx],D.slides[idx+1]];idx++;draw();save()}};
// presentazione
let pi=-1;const P=$('#pres');
const show=()=>paint($('#pstage'),pi);
$('#present').onclick=()=>{pi=idx;P.hidden=false;show();if(P.requestFullscreen)P.requestFullscreen().catch(()=>{})};
const close=()=>{P.hidden=true;if(document.fullscreenElement)document.exitFullscreen()};$('#pclose').onclick=close;
P.onclick=e=>{if(e.target.closest('#pclose'))return;if(pi<n()){pi++;show()}};
addEventListener('keydown',e=>{if(P.hidden)return;if(e.key==='Escape')close();if(['ArrowRight',' ','PageDown'].includes(e.key)&&pi<n()){pi++;show()}if(['ArrowLeft','PageUp'].includes(e.key)&&pi>-1){pi--;show()}});
$('#expptx').onclick=async()=>{try{await buildDeck(PptxGenJS,{...D.meta,slides:D.slides.map(s=>({title:s.title,bullets:s.bullets}))}).writeFile({fileName:slug($('#title').value||'presentazione')+'.pptx'})}catch(e){toast('Errore: '+e.message)}};
draw();
