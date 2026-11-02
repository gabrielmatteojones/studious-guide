import {$,$$,get,patch,toast,debounce,sanitize,saver,openItem,download,slug,user} from './drive-core.js';
const it=await openItem('doc');if(!it)throw 0;
const ed=$('#ed');ed.innerHTML=sanitize(it.html||'<p><br></p>');
const save=saver(async()=>patch(it.id,{html:sanitize(ed.innerHTML),name:$('#title').value.trim()||'Documento senza titolo'}));
ed.addEventListener('input',save);$('#title').addEventListener('input',save);
document.execCommand('styleWithCSS',false,true);
$$('#tb [data-c]').forEach(b=>b.onmousedown=e=>{e.preventDefault();document.execCommand(b.dataset.c);ed.focus();save()});
$('#blk').onchange=e=>{ed.focus();document.execCommand('formatBlock',false,e.target.value);save()};
$('#col').oninput=e=>{ed.focus();document.execCommand('foreColor',false,e.target.value);save()};
$('#lnk').onmousedown=e=>{e.preventDefault();const u=prompt('Indirizzo del link (https://…)');if(u&&/^(https?:\/\/|mailto:)/i.test(u)){document.execCommand('createLink',false,u);save()}else if(u)toast('Sono ammessi solo link https:// o mailto:')};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save()}});
const name=()=>$('#title').value.trim()||'documento';
$('#exdoc').onclick=()=>download(new Blob(['<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>'+name().replace(/</g,'')+'</title></head><body style="font-family:Calibri,Arial;font-size:11pt">'+sanitize(ed.innerHTML)+'</body></html>'],{type:'application/msword'}),slug(name())+'.doc');
$('#print').onclick=()=>print();
// PDF su carta intestata (stessa impostazione dell'area gestionale)
$('#expdf').onclick=async()=>{try{
 const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4'}),LH=window.LH||{},LG=window.LEGAL||{};
 const im=new Image();im.src=LH.image||'/assets/img/carta-intestata.png';await im.decode();const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;cv.getContext('2d').drawImage(im,0,0);const bg=cv.toDataURL('image/png');
 const W=210,H=297,L=+LH.left||22,R=+LH.right||22,T=+LH.top||52,B=+LH.bottom||36,mw=W-L-R;let y=T;
 const page=()=>{doc.addImage(bg,'PNG',0,0,W,H);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(106,84,91);doc.text([LG.indirizzo,LG.email,LG.piva_cf].filter(Boolean).join('  ·  '),W/2,H-27,{align:'center',maxWidth:mw});doc.setTextColor(0)};page();
 const put=(t,sz,bold,ind=0,gap=1.2)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(sz);const lh=sz*.46;doc.splitTextToSize(t||' ',mw-ind).forEach(r=>{if(y>H-B){doc.addPage();page();y=T}doc.text(r,L+ind,y);y+=lh});y+=gap};
 const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){if(c.textContent.trim())put(c.textContent.trim(),11,false)}else if(c.nodeType===1){const t=c.tagName;
  if(t==='H1')put(c.innerText,18,true,0,3);else if(t==='H2')put(c.innerText,14,true,0,2.5);else if(t==='H3')put(c.innerText,12,true,0,2);
  else if(t==='UL'||t==='OL')[...c.children].forEach((li,i)=>put((t==='UL'?'•  ':(i+1)+'.  ')+li.innerText,11,false,4,.8));
  else if(t==='BR')y+=4;else if(['P','DIV','BLOCKQUOTE'].includes(t)){if(c.querySelector('h1,h2,h3,ul,ol,p,div'))walk(c);else put(c.innerText,11,/^(B|STRONG)$/.test(c.firstElementChild&&c.firstElementChild.tagName)&&c.innerText===c.firstElementChild.innerText,0,2.2)}
  else put(c.innerText,11,/^(B|STRONG)$/.test(t))}})};
 walk(ed);doc.save(slug(name())+'.pdf')}catch(e){console.error(e);toast('Errore PDF: '+e.message)}};
