// Nucleo del Drive: connessione Firebase, accesso, accesso ai dati (Firestore) e utilità comuni.
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {getFirestore,collection,doc,addDoc,getDoc,getDocs,updateDoc,deleteDoc,query,where,orderBy,limit} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
export const app=getApps().length?getApp():initializeApp(window.FIREBASE_CONFIG),auth=getAuth(app),db=getFirestore(app);
export const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
export const user=new Promise(res=>onAuthStateChanged(auth,u=>{if(!u){location.replace('/accedi/?next='+encodeURIComponent(location.pathname+location.search+location.hash));return}res(u)}));
const col=async()=>collection(db,'users',(await user).uid,'items');
const ref=async id=>doc(db,'users',(await user).uid,'items',id);
const wrap=s=>({id:s.id,...s.data()});
export async function create(type,name,parent='root',extra={}){const r=await addDoc(await col(),{type,name,parent,trashed:false,created:Date.now(),updated:Date.now(),...extra});return r.id}
export async function get(id){const s=await getDoc(await ref(id));return s.exists()?wrap(s):null}
export async function patch(id,data){await updateDoc(await ref(id),{...data,updated:Date.now()})}
export async function remove(id){await deleteDoc(await ref(id))}
export async function listBy(f,v){return (await getDocs(query(await col(),where(f,'==',v)))).docs.map(wrap)}
export async function all(){return (await getDocs(await col())).docs.map(wrap)}
export async function recent(n=40){return (await getDocs(query(await col(),orderBy('updated','desc'),limit(n)))).docs.map(wrap)}
export const ICON={folder:'📁',doc:'📝',slides:'🎞️',sheet:'📊',file:'📄'};
export const fmtSize=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
export const fmtDate=t=>new Date(t).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
export const toast=m=>window.toast&&window.toast(m);
export const debounce=(f,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};
export const qid=()=>new URLSearchParams(location.search).get('id');
export const slug=s=>String(s||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'file';
export function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
// Pulizia HTML dei documenti (niente script, iframe, eventi inline, link javascript:)
export function sanitize(html){const d=new DOMParser().parseFromString('<body>'+html+'</body>','text/html');
 d.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(e=>e.remove());
 d.body.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{const n=a.name.toLowerCase(),v=a.value.trim().toLowerCase();if(n.startsWith('on')||((n==='href'||n==='src')&&!/^(https?:|mailto:|#|\/)/.test(v)&&!v.startsWith('data:image/')))e.removeAttribute(a.name)})});
 return d.body.innerHTML}
// Stato di salvataggio mostrato accanto al titolo
export function saver(fn){const st=$('#st');const run=debounce(async()=>{try{st.textContent='Salvataggio…';await fn();st.textContent='Salvato ✓'}catch(e){console.error(e);st.textContent='Errore di salvataggio'}},900);return()=>{st.textContent='Modificato…';run()}}
export async function openItem(type){const id=qid();if(!id){location.replace('/drive/');return null}const it=await get(id);if(!it||it.type!==type){toast('Elemento non trovato');setTimeout(()=>location.replace('/drive/'),1200);return null}$('#title').value=it.name;$('#st').textContent='Salvato ✓';return it}
