// Gestione consenso cookie (Linee guida Garante 2021: rifiuto facile come l'accettazione, X = rifiuta, scelta rinnovata dopo 6 mesi)
const KEY='gj_consent',MAX=60*60*24*180;
const $=s=>document.querySelector(s);
function read(){try{const m=document.cookie.split('; ').find(c=>c.startsWith(KEY+'='));return m?JSON.parse(decodeURIComponent(m.split('=')[1])):null}catch(e){return null}}
function save(c){c.t=Date.now();document.cookie=KEY+'='+encodeURIComponent(JSON.stringify(c))+';max-age='+MAX+';path=/;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');window.dispatchEvent(new CustomEvent('consent',{detail:c}))}
function clearAnalytics(){document.cookie.split(';').forEach(c=>{const n=c.split('=')[0].trim();if(n.startsWith('_ga')||n.startsWith('_gid'))document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.'+location.hostname.replace(/^www\./,'')+';'+'';document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'})}
let started=false;
async function startAnalytics(){
 if(started||!window.FIREBASE_CONFIG||!window.FIREBASE_CONFIG.measurementId)return;started=true;
 const {initializeApp,getApps,getApp}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
 const {getAnalytics,isSupported}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js');
 if(!(await isSupported()))return;
 const app=getApps().length?getApp():initializeApp(window.FIREBASE_CONFIG);getAnalytics(app);
}
const box=$('#ck'),opt=$('#ckopt'),an=$('#ck-an');
function show(){box.hidden=false;const c=read();an.checked=!!(c&&c.analytics)}
function hide(){box.hidden=true;opt.hidden=true}
function apply(c){if(c.analytics)startAnalytics();else{clearAnalytics()}}
function choose(analytics){const prev=read();save({analytics});hide();if(prev&&prev.analytics&&!analytics){window.toast&&window.toast('Preferenze salvate. Ricarico la pagina…');setTimeout(()=>location.reload(),900)}else apply({analytics})}
const cur=read();
if(!cur||Date.now()-cur.t>MAX*1000)show();else apply(cur);
$('#ck-ok').onclick=()=>choose(true);
$('#ck-no').onclick=()=>choose(false);
$('#ckx').onclick=()=>choose(false);
$('#ck-cu').onclick=()=>{if(opt.hidden){opt.hidden=false;$('#ck-cu').textContent='Salva la mia scelta'}else choose(an.checked)};
document.querySelectorAll('[data-cookie-prefs]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$('#ck-cu').textContent='Personalizza';show();opt.hidden=false;$('#ck-cu').textContent='Salva la mia scelta'}));
