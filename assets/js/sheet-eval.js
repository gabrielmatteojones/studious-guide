// Motore di calcolo del foglio: nessun eval(), solo un piccolo parser di formule.
export const colName=n=>{let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
export const colIndex=s=>s.toUpperCase().split('').reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
class E{constructor(c){this.code=c}}
const ALIAS={SOMMA:'SUM',MEDIA:'AVERAGE',CONTA:'COUNT',SE:'IF',ARROTONDA:'ROUND'};
export function makeSheet(raw){ // raw(ref) -> stringa
 const cache=new Map(),stack=new Set();
 const toNum=v=>{if(v===''||v==null)return 0;if(typeof v==='number')return v;const n=Number(String(v).replace(',','.'));if(Number.isFinite(n))return n;throw new E('#VALORE!')};
 function cell(ref){ref=ref.toUpperCase();if(cache.has(ref))return cache.get(ref);if(stack.has(ref))throw new E('#CIRC!');stack.add(ref);let v;
  try{const r=raw(ref);if(r==null||r==='')v='';else if(String(r)[0]==='=')v=formula(String(r).slice(1));else{const n=Number(String(r).replace(',','.'));v=(String(r).trim()!==''&&Number.isFinite(n))?n:String(r)}}
  catch(e){stack.delete(ref);cache.set(ref,e);throw e}
  stack.delete(ref);cache.set(ref,v);return v}
 function range(a,b){const [,c1,r1]=/^([A-Z]+)(\d+)$/.exec(a.toUpperCase()),[,c2,r2]=/^([A-Z]+)(\d+)$/.exec(b.toUpperCase());const out=[];
  for(let r=Math.min(+r1,+r2);r<=Math.max(+r1,+r2);r++)for(let c=Math.min(colIndex(c1),colIndex(c2));c<=Math.max(colIndex(c1),colIndex(c2));c++)out.push(cell(colName(c)+r));return out}
 function formula(src){
  const T=[],re=/\s*(?:(\d+(?:\.\d+)?)|([A-Za-z]+\d+:[A-Za-z]+\d+)|([A-Za-z]+\d+)|([A-Za-z]+)\s*\(|"([^"]*)"|(<>|<=|>=|[-+*\/^(),;<>=&%]))/y;let m;
  while(re.lastIndex<src.trim().length+ (src.length-src.trimStart().length)&&(m=re.exec(src))){if(m[1]!=null)T.push(['n',+m[1]]);else if(m[2])T.push(['r',m[2]]);else if(m[3])T.push(['c',m[3]]);else if(m[4])T.push(['f',m[4].toUpperCase()]);else if(m[5]!=null)T.push(['s',m[5]]);else T.push(['o',m[6]])}
  if(re.lastIndex<src.replace(/\s+$/,'').length)throw new E('#ERR!');
  let i=0;const peek=()=>T[i],eat=()=>T[i++],isO=o=>T[i]&&T[i][0]==='o'&&(Array.isArray(o)?o.includes(T[i][1]):T[i][1]===o);
  const scalar=v=>{if(Array.isArray(v))throw new E('#VALORE!');return v};
  function cmp(){let a=concat();while(isO(['=','<>','<','>','<=','>='])){const o=eat()[1];let b=concat();a=scalar(a);b=scalar(b);const x=typeof a==='string'||typeof b==='string'?String(a):a,y=typeof a==='string'||typeof b==='string'?String(b):b;a=o==='='?x==y:o==='<>'?x!=y:o==='<'?x<y:o==='>'?x>y:o==='<='?x<=y:x>=y}return a}
  function concat(){let a=add();while(isO('&')){eat();a=String(scalar(a))+String(scalar(add()))}return a}
  function add(){let a=mul();while(isO(['+','-'])){const o=eat()[1],b=mul();a=o==='+'?toNum(scalar(a))+toNum(scalar(b)):toNum(scalar(a))-toNum(scalar(b))}return a}
  function mul(){let a=pow();while(isO(['*','/'])){const o=eat()[1],b=toNum(scalar(pow()));if(o==='/'&&b===0)throw new E('#DIV/0!');a=o==='*'?toNum(scalar(a))*b:toNum(scalar(a))/b}return a}
  function pow(){let a=un();if(isO('^')){eat();a=Math.pow(toNum(scalar(a)),toNum(scalar(pow())))}return a}
  function un(){if(isO('-')){eat();return -toNum(scalar(un()))}if(isO('+')){eat();return un()}let a=atom();if(isO('%')){eat();a=toNum(scalar(a))/100}return a}
  function atom(){const t=eat();if(!t)throw new E('#ERR!');
   if(t[0]==='n'||t[0]==='s')return t[1];
   if(t[0]==='c')return cell(t[1]);
   if(t[0]==='r'){const [a,b]=t[1].split(':');return range(a,b)}
   if(t[0]==='o'&&t[1]==='('){const v=cmp();if(!isO(')'))throw new E('#ERR!');eat();return v}
   if(t[0]==='f'){const args=[];if(!isO(')')){args.push(cmp());while(isO([',',';'])){eat();args.push(cmp())}}if(!isO(')'))throw new E('#ERR!');eat();return call(ALIAS[t[1]]||t[1],args)}
   throw new E('#ERR!')}
  const nums=a=>a.flat(Infinity).filter(v=>typeof v==='number');
  function call(f,a){switch(f){
   case'SUM':return nums(a).reduce((x,y)=>x+y,0);
   case'AVERAGE':{const n=nums(a);if(!n.length)throw new E('#DIV/0!');return n.reduce((x,y)=>x+y,0)/n.length}
   case'MIN':{const n=nums(a);return n.length?Math.min(...n):0}
   case'MAX':{const n=nums(a);return n.length?Math.max(...n):0}
   case'COUNT':return nums(a).length;
   case'ABS':return Math.abs(toNum(scalar(a[0])));
   case'ROUND':{const k=Math.pow(10,a[1]==null?0:toNum(scalar(a[1])));return Math.round(toNum(scalar(a[0]))*k)/k}
   case'IF':return scalar(a[0])&&scalar(a[0])!==0&&scalar(a[0])!==''?scalar(a[1]??''):scalar(a[2]??'');
   default:throw new E('#NOME?')}}
  const r=cmp();if(i<T.length)throw new E('#ERR!');return Array.isArray(r)?(()=>{throw new E('#VALORE!')})():r}
 return{value(ref){try{return cell(ref)}catch(e){if(e instanceof E)return e;return new E('#ERR!')}},
  text(ref){const v=this.value(ref);if(v instanceof E)return v.code;if(typeof v==='number')return String(+v.toPrecision(12)).replace('.',',');if(typeof v==='boolean')return v?'VERO':'FALSO';return String(v)}}
}
