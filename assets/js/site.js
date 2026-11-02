(function(){
 if(/(invite|recovery|confirmation|email_change)_token=/.test(location.hash)&&location.pathname.indexOf('/gestione')!==0){location.replace('/gestione/'+location.hash);return}
 var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
 window.toast=function(m){var ts=$('#toast');if(!ts)return;ts.textContent=m;ts.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(function(){ts.classList.remove('show')},3200)};
 var h=$('#h1');if(h){h.setAttribute('aria-label',h.textContent);h.innerHTML=h.textContent.split(' ').map(function(w,i){return '<span class="w" aria-hidden="true"><span style="--i:'+i+'">'+w+'</span></span> '}).join('')}
 var tk=$('#tk');if(tk){var t='';for(var k=0;k<3;k++)t+='<span>PLAYBOOK • 288 SCHEDE GIOCO • 7 LIBRI TEMATICI • 4–18 ANNI •</span><span>OGGI GIOCHIAMO! •</span>';tk.innerHTML=t}
 function count(el){var to=+el.dataset.to,s=performance.now();(function f(n){var p=Math.min((n-s)/1600,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(s)}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');$$('[data-to]',e.target).forEach(count);io.unobserve(e.target)}})},{threshold:.15});$$('.rv').forEach(function(e){io.observe(e)});
 var path=document.body.dataset.path||'/';$$('#nav a').forEach(function(a){var p=a.getAttribute('href');a.classList.toggle('act',p===path||(p!=='/'&&path.indexOf(p)===0))});
 var ov=$('#ov');function close(){ov.classList.remove('open')}function open(f){ov.classList.add('open');if(f)setTimeout(function(){$('#oi').focus()},400)}
 $('#mn').onclick=function(){open(false)};$('#sr').onclick=function(){open(true)};$('#cl').onclick=close;addEventListener('keydown',function(e){if(e.key==='Escape')close()});
 $('#oi').oninput=function(){var v=this.value.toLowerCase();$$('#ol li').forEach(function(l){l.style.display=l.textContent.toLowerCase().indexOf(v)>-1?'':'none'})};
 var qt=$('#qt'),sp=[];if(qt){qt.innerHTML=qt.textContent.split(' ').map(function(w){return '<span>'+w+'</span>'}).join(' ');sp=$$('span',qt)}
 function sc(){var d=document.documentElement,m=d.scrollHeight-innerHeight;$('#bar').style.width=(m>0?scrollY/m*100:0)+'%';if(qt){var r=qt.getBoundingClientRect(),v=Math.max(0,Math.min(1,(innerHeight*.85-r.top)/(innerHeight*.6)));sp.forEach(function(s,i){s.classList.toggle('on',i<v*sp.length)})}}
 addEventListener('scroll',sc,{passive:true});sc();
 var rail=$('#rail');if(rail){$('#nx').onclick=function(){rail.scrollBy({left:320,behavior:'smooth'})};$('#pv').onclick=function(){rail.scrollBy({left:-320,behavior:'smooth'})}}
 $$('.stk').forEach(function(s){var sx,sy,ox,oy,on=false;
  s.addEventListener('pointerdown',function(e){if(innerWidth<=860)return;on=true;sx=e.clientX;sy=e.clientY;ox=s.offsetLeft;oy=s.offsetTop;s.setPointerCapture(e.pointerId);s.style.zIndex=5});
  s.addEventListener('pointermove',function(e){if(!on)return;s.style.left=(ox+e.clientX-sx)+'px';s.style.top=(oy+e.clientY-sy)+'px';s.style.right='auto';s.style.bottom='auto'});
  s.addEventListener('pointerup',function(){on=false})});
 $$('.chip[data-f]').forEach(function(c){c.onclick=function(){$$('.chip[data-f]').forEach(function(x){x.classList.toggle('on',x===c)});$$('.work').forEach(function(w){w.classList.toggle('hide',c.dataset.f!=='all'&&(w.dataset.c||'').split(' ').indexOf(c.dataset.f)<0)})}});
 $$('.work').forEach(function(w,i){w.style.background=['var(--tom)','var(--kale)','var(--peri)','var(--wine)'][i%4];w.addEventListener('mousemove',function(e){var r=w.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;w.style.transform='perspective(700px) rotateY('+x*10+'deg) rotateX('+(-y*10)+'deg) translateY(-5px)'});w.addEventListener('mouseleave',function(){w.style.transform=''})});
 $$('.post button').forEach(function(b){b.onclick=function(){var p=b.parentNode,o=!p.classList.contains('open');$$('.post').forEach(function(x){x.classList.remove('open');$('button',x).setAttribute('aria-expanded','false')});if(o){p.classList.add('open');b.setAttribute('aria-expanded','true')}}});
 var q=$('#q');if(q)q.oninput=function(){var v=this.value.toLowerCase(),n=0;$$('.doc').forEach(function(d){var m=d.textContent.toLowerCase().indexOf(v)>-1;d.style.display=m?'':'none';if(m)n++});$('#empty').style.display=n?'none':'block'};
 $$('.cart').forEach(function(c){c.onclick=function(){c.classList.remove('flip');void c.offsetWidth;c.classList.add('flip')}});
 // Firebase: caricato solo dove serve (login/area utenti) o se l'utente è già loggato
 var logged=Object.keys(localStorage).some(function(k){return k.indexOf('firebase:authUser:')===0});
 if(document.body.dataset.firebase||logged)import('/assets/js/firebase-auth.js');
})();
