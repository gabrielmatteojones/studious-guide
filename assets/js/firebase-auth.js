// Login Firebase ad accesso chiuso: nessuna registrazione pubblica. Gli utenti li crei tu da Firebase → Authentication → Users → Add user.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,deleteUser,setPersistence,browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
const app=initializeApp(window.FIREBASE_CONFIG),auth=getAuth(app);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ERR={'auth/invalid-credential':'Email o password non corrette.','auth/invalid-login-credentials':'Email o password non corrette.','auth/user-not-found':'Utente non trovato.','auth/wrong-password':'Password non corretta.','auth/user-disabled':'Questo account è disattivato.','auth/invalid-email':'Indirizzo email non valido.','auth/too-many-requests':'Troppi tentativi. Riprova tra qualche minuto.','auth/requires-recent-login':'Per sicurezza esci, accedi di nuovo e riprova.','auth/network-request-failed':'Connessione assente o bloccata (controlla eventuali blocchi di contenuti).',
 'auth/operation-not-allowed':'Accesso con email/password non abilitato: in Firebase → Authentication → Sign-in method attiva “Email/Password”.','auth/unauthorized-domain':'Dominio non autorizzato: in Firebase → Authentication → Settings → Authorized domains aggiungi '+location.hostname+'.','auth/invalid-api-key':'Chiave API Firebase non valida (controlla _config.yml).','auth/configuration-not-found':'Firebase Authentication non è ancora attivo: apri Authentication nella console e premi “Inizia”.'};
const msg=(t,ok)=>{const m=$('#amsg');if(!m)return;m.hidden=!t;m.textContent=t||'';m.className='msg'+(ok?' ok':'')};
const fail=e=>{console.error(e);msg(ERR[e.code]||('Errore di accesso ('+(e.code||e.message)+')'))};
try{await setPersistence(auth,browserLocalPersistence)}catch(e){console.warn(e)}
onAuthStateChanged(auth,u=>{
 $$('[data-acct]').forEach(a=>{a.textContent=u?'Area utenti':'Accedi';a.href=u?'/area-utenti/':'/accedi/'});
 if(location.pathname==='/accedi/'&&u)location.replace('/area-utenti/');
 if(location.pathname==='/area-utenti/'){
  $('#needlogin').hidden=!!u;$('#userarea').hidden=!u;
  $('#uwho').textContent=u?('Ciao '+(u.displayName||u.email)+'!'):'Accesso richiesto.';
  if(u){$('#uemail').textContent=u.email;$('#uver').textContent=u.emailVerified?'Verificata ✓':'Non verificata'}
 }
 const lock=$('#rlock');if(lock){lock.hidden=!!u;$('#rdl').hidden=!u}   // pagina di un documento riservato
});
if($('#atabs')){
 $$('#atabs .chip').forEach(c=>c.onclick=()=>{$$('#atabs .chip').forEach(x=>x.classList.toggle('on',x===c));['in','rs'].forEach(k=>$('#f-'+k).hidden=k!==c.dataset.t);msg('')});
 $('#f-in').onsubmit=async e=>{e.preventDefault();const f=e.target,b=f.querySelector('button');b.disabled=true;msg('Accesso in corso…',true);try{await signInWithEmailAndPassword(auth,f.email.value.trim(),f.password.value)}catch(x){fail(x)}b.disabled=false};
 $('#f-rs').onsubmit=async e=>{e.preventDefault();try{await sendPasswordResetEmail(auth,e.target.email.value.trim());msg('Se l’indirizzo è registrato, riceverai un’email con il link per reimpostare la password.',true)}catch(x){fail(x)}};
}
if($('#out')){
 $('#out').onclick=async()=>{await signOut(auth);location.href='/'};
 $('#del').onclick=async()=>{if(!confirm('Eliminare definitivamente il tuo account? L’operazione non è reversibile.'))return;try{await deleteUser(auth.currentUser);window.toast('Account eliminato.');location.href='/'}catch(x){window.toast(ERR[x.code]||x.code)}};
}
