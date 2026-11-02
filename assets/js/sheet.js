import {$,$$,patch,toast,saver,openItem,download,slug} from './drive-core.js';
import {makeSheet,colName} from './sheet-eval.js';
const it=await openItem('sheet');if(!it)throw 0;
const raw={...(it.cells||{})};let rows=it.rows||50;const COLS=it.cols||12;let sel='A1',ev;
const save=saver(()=>{const c={};Object.keys(raw).forEach(k=>{if(raw[k]!==''&&raw[k]!=null)c[k]=raw[k]});return patch(it.id,{cells:c,rows,cols:COLS,name:$('#title').value.trim()||'Foglio senza titolo'})});
$('#title').addEventListener('input',save);
const sh=$('#sh');
function build(){sh.textContent='';const th=document.createElement('tr');th.append(document.createElement('th'));for(let c=0;c<COLS;c++){const h=document.createElement('th');h.textContent=colName(c);th.append(h)}sh.append(th);
 for(let r=1;r<=rows;r++){const tr=document.createElement('tr'),rh=document.createElement('th');rh.textContent=r;tr.append(rh);
  for(let c=0;c<COLS;c++){const ref=colName(c)+r,td=document.createElement('td'),i=document.createElement('input');i.dataset.ref=ref;i.setAttribute('aria-label',ref);i.autocomplete='off';
   i.onfocus=()=>{sel=ref;i.value=raw[ref]??'';$('#cell').textContent=ref;$('#fx').value=raw[ref]??'';$$('.cur',sh).forEach(x=>x.classList.remove('cur'));td.classList.add('cur')};
   i.oninput=()=>{raw[ref]=i.value;$('#fx').value=i.value;save()};
   i.onblur=()=>{refresh()};
   i.onkeydown=e=>{const mv=(dc,dr)=>{e.preventDefault();const m=/^([A-Z]+)(\d+)$/.exec(ref),ci=c+dc,ri=+m[2]+dr;const t=sh.querySelector(`input[data-ref="${colName(ci)}${ri}"]`);if(t)t.focus()};
    if(e.key==='Enter')mv(0,1);else if(e.key==='ArrowDown')mv(0,1);else if(e.key==='ArrowUp')mv(0,-1);else if(e.key==='Escape'){i.value=raw[ref]??'';i.blur()}};
   td.append(i);tr.append(td)}sh.append(tr)}refresh()}
function refresh(){ev=makeSheet(r=>raw[r]);$$('input[data-ref]',sh).forEach(i=>{if(document.activeElement===i)return;const r=i.dataset.ref,t=ev.text(r),v=ev.value(r);i.value=raw[r]==null||raw[r]===''?'':t;i.className=(typeof v==='number'?'num ':'')+(v&&v.code?'err':'')})}
$('#fx').oninput=e=>{raw[sel]=e.target.value;const i=sh.querySelector(`input[data-ref="${sel}"]`);if(i)i.value=e.target.value;save()};
$('#fx').onkeydown=e=>{if(e.key==='Enter'){refresh();const i=sh.querySelector(`input[data-ref="${sel}"]`);if(i)i.focus()}};
$('#fx').onblur=refresh;
$('#addrow').onclick=()=>{rows+=20;build();save()};
$('#exp').onclick=()=>{ev=makeSheet(r=>raw[r]);let last=0,lc=0;Object.keys(raw).forEach(k=>{if(raw[k]!==''){const m=/^([A-Z]+)(\d+)$/.exec(k);last=Math.max(last,+m[2]);lc=Math.max(lc,[...m[1]].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0))}});
 const out=[];for(let r=1;r<=last;r++){const row=[];for(let c=0;c<lc;c++){let t=ev.text(colName(c)+r);if(/[;"\n]/.test(t))t='"'+t.replace(/"/g,'""')+'"';row.push(t)}out.push(row.join(';'))}
 download(new Blob(['\ufeff'+out.join('\r\n')],{type:'text/csv;charset=utf-8'}),slug($('#title').value||'foglio')+'.csv')};
function parseCSV(t){const d=(t.split('\n')[0].match(/;/g)||[]).length>=(t.split('\n')[0].match(/,/g)||[]).length?';':',';const out=[];let row=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===d){row.push(f);f=''}else if(c==='\n'){row.push(f.replace(/\r$/,''));out.push(row);row=[];f=''}else f+=c}
 if(f||row.length){row.push(f.replace(/\r$/,''));out.push(row)}return out}
$('#imp').onclick=()=>$('#impf').click();
$('#impf').onchange=async e=>{const f=e.target.files[0];if(!f)return;const data=parseCSV((await f.text()).replace(/^\ufeff/,''));
 if(!confirm('Importare '+data.length+' righe? Il contenuto attuale verrà sostituito.')){e.target.value='';return}
 Object.keys(raw).forEach(k=>delete raw[k]);data.forEach((r,ri)=>r.forEach((v,ci)=>{if(ci<COLS&&v!=='')raw[colName(ci)+(ri+1)]=v}));rows=Math.max(rows,data.length+10);build();save();e.target.value=''};
build();
