// Modello di presentazione di Gabriel Jones. Uso: buildDeck(PptxGenJS, {title, subtitle, author, date, slides:[{title, bullets:[...]}]})
(function(root){
 var C={wine:'6D0F2B',deep:'3E0716',ban:'FFD84D',tom:'F0452A',kale:'0E9A5B',peri:'6F9BF2',aqua:'CDEDE6',paper:'FFFDF7',ink:'24121A'};
 function buildDeck(P,d){
  var p=new P();p.layout='LAYOUT_WIDE';p.author=d.author||'Gabriel Jones';p.title=d.title||'Presentazione';
  p.defineSlideMaster({title:'COVER',background:{color:C.wine},objects:[
   {rect:{x:0,y:6.9,w:13.33,h:0.6,fill:{color:C.deep}}},
   {ellipse:{x:10.2,y:-1.2,w:4.2,h:4.2,fill:{color:C.ban}}},{ellipse:{x:11.6,y:5.1,w:2.4,h:2.4,fill:{color:C.tom}}},{ellipse:{x:9.6,y:5.6,w:1.1,h:1.1,fill:{color:C.peri}}}]});
  p.defineSlideMaster({title:'CONTENT',background:{color:C.paper},objects:[
   {rect:{x:0,y:0,w:13.33,h:0.35,fill:{color:C.wine}}},{rect:{x:0,y:0.35,w:13.33,h:0.07,fill:{color:C.ban}}},
   {text:{text:d.author||'Gabriel Jones',options:{x:0.6,y:7.0,w:6,h:0.3,fontSize:11,color:'6A545B',fontFace:'Calibri'}}}],
   slideNumber:{x:12.3,y:7.0,w:0.6,h:0.3,fontSize:11,color:'6A545B'}});
  p.defineSlideMaster({title:'CLOSING',background:{color:C.deep},objects:[{ellipse:{x:-1.2,y:4.6,w:4.4,h:4.4,fill:{color:C.wine}}},{ellipse:{x:11.4,y:-0.8,w:2.6,h:2.6,fill:{color:C.ban}}}]});
  var s=p.addSlide({masterName:'COVER'});
  s.addText(d.title||'Titolo della presentazione',{x:0.8,y:2.0,w:9,h:2.2,fontSize:48,bold:true,color:'FFFFFF',fontFace:'Calibri',valign:'bottom',fit:'shrink'});
  s.addText(d.subtitle||'',{x:0.8,y:4.3,w:9,h:0.9,fontSize:22,color:C.ban,fontFace:'Calibri',valign:'top'});
  s.addText([d.author||'Gabriel Jones',d.date||''].filter(Boolean).join('  ·  '),{x:0.8,y:6.9,w:9,h:0.6,fontSize:14,color:'FFFFFF',fontFace:'Calibri',valign:'middle'});
  (d.slides||[]).forEach(function(x,i){
   var c=p.addSlide({masterName:'CONTENT'}),acc=[C.tom,C.kale,C.peri,C.ban][i%4];
   c.addShape('ellipse',{x:0.6,y:0.85,w:0.34,h:0.34,fill:{color:acc},line:{color:C.ink,width:2}});
   c.addText(x.title||'',{x:1.1,y:0.7,w:11.5,h:0.7,fontSize:32,bold:true,color:C.wine,fontFace:'Calibri',valign:'middle',fit:'shrink'});
   if(x.bullets&&x.bullets.length)c.addText(x.bullets.map(function(b){return {text:b,options:{bullet:{code:'25CF'},breakLine:true,paraSpaceAfter:10}}}),{x:0.9,y:1.8,w:11.5,h:4.9,fontSize:22,color:C.ink,fontFace:'Calibri',valign:'top',fit:'shrink'});
  });
  var e=p.addSlide({masterName:'CLOSING'});
  e.addText(d.closing||'Grazie!',{x:1.0,y:2.4,w:10,h:1.6,fontSize:60,bold:true,color:'FFFFFF',fontFace:'Calibri'});
  e.addText(d.contact||'',{x:1.0,y:4.2,w:10,h:1,fontSize:20,color:C.ban,fontFace:'Calibri'});
  return p;
 }
 // "Titolo\nvoce\nvoce" separati da riga vuota
 function parseSlides(t){return String(t||'').split(/\n\s*\n/).map(function(b){var l=b.split('\n').map(function(x){return x.trim()}).filter(Boolean);return l.length?{title:l[0],bullets:l.slice(1).map(function(x){return x.replace(/^[-•*]\s*/,'')})}:null}).filter(Boolean)}
 root.buildDeck=buildDeck;root.parseSlides=parseSlides;
 if(typeof module!=='undefined')module.exports={buildDeck:buildDeck,parseSlides:parseSlides};
})(typeof window!=='undefined'?window:globalThis);
