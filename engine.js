// SwarmX PSO engine: pure functions, no DOM access.

const TAU=Math.PI*2;
const FN={sphere:{n:'Sphere',eq:'x² + y²',d:[-5,5],o:[0,0],f:(x,y)=>x*x+y*y},
rastrigin:{n:'Rastrigin',eq:'20 + x² + y² − 10[cos 2πx + cos 2πy]',d:[-5.12,5.12],o:[0,0],f:(x,y)=>20+x*x+y*y-10*(Math.cos(TAU*x)+Math.cos(TAU*y))},
rosenbrock:{n:'Rosenbrock',eq:'(1−x)² + 100(y−x²)²',d:[-2,2],o:[1,1],f:(x,y)=>(1-x)**2+100*(y-x*x)**2},
ackley:{n:'Ackley',eq:'−20·exp(−0.2·√((x²+y²)/2)) − exp((cos 2πx + cos 2πy)/2) + e + 20',d:[-5,5],o:[0,0],f:(x,y)=>-20*Math.exp(-.2*Math.sqrt((x*x+y*y)/2))-Math.exp((Math.cos(TAU*x)+Math.cos(TAU*y))/2)+Math.E+20},
booth:{n:'Booth',eq:'(x + 2y − 7)² + (2x + y − 5)²',d:[-10,10],o:[1,3],f:(x,y)=>(x+2*y-7)**2+(2*x+y-5)**2}};
const PRE={Balanced:[.7,1.5,1.5],Exploration:[.9,2,1],Exploitation:[.4,1,2],'Fast convergence':[.5,1.5,2.5]};
// ---------- PSO engine (pure, no DOM) ----------
function rnd(s){s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return[((t^t>>>14)>>>0)/4294967296,s]}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function init(P){let s=P.seed|0;const R=()=>{const r=rnd(s);s=r[1];return r[0]},f=FN[P.fn].f,parts=[];
 for(let i=0;i<P.n;i++){const x=[P.lo+R()*(P.hi-P.lo),P.lo+R()*(P.hi-P.lo)],v=[(R()*2-1)*P.vi,(R()*2-1)*P.vi],fi=f(...x);parts.push({x,v,f:fi,px:x.slice(),pf:fi})}
 let gid=0;parts.forEach((p,i)=>{if(P.sgn*p.pf<P.sgn*parts[gid].pf)gid=i});
 return{it:0,parts,g:{x:parts[gid].px.slice(),f:parts[gid].pf},gid,rs:s,calc:null}}
function step(S,P,fx){let s=S.rs;const R=()=>{const r=rnd(s);s=r[1];return r[0]},f=FN[P.fn].f,calc=[];
 const parts=S.parts.map((p,i)=>{const c={x0:p.x,v0:p.v,px:p.px,gx:S.g.x,r1:[],r2:[],in:[],co:[],so:[],vr:[],v1:[],xr:[],x1:[],clipV:[],clipX:[]},v=[],x=[];
  for(let d=0;d<2;d++){const r1=fx?fx[i].r1[d]:R(),r2=fx?fx[i].r2[d]:R();c.r1.push(r1);c.r2.push(r2);
   const a=P.w*p.v[d],b=P.c1*r1*(p.px[d]-p.x[d]),e=P.c2*r2*(S.g.x[d]-p.x[d]),vr=a+b+e;c.in.push(a);c.co.push(b);c.so.push(e);c.vr.push(vr);
   let v1=clamp(vr,-P.vmax,P.vmax);c.clipV.push(v1!==vr);const xr=p.x[d]+v1;let x1=clamp(xr,P.lo,P.hi);if(x1!==xr){v1=0;c.clipX.push(true)}else c.clipX.push(false);
   c.v1.push(v1);c.xr.push(xr);c.x1.push(x1);v.push(v1);x.push(x1)}
  const fi=f(...x),up=P.sgn*fi<P.sgn*p.pf;c.f1=fi;c.up=up;calc.push(c);
  return{x,v,f:fi,px:up?x.slice():p.px,pf:up?fi:p.pf}});
 let g=S.g,gid=S.gid,gu=false;parts.forEach((p,i)=>{if(P.sgn*p.pf<P.sgn*g.f){g={x:p.px.slice(),f:p.pf};gid=i;gu=true}});
 return{it:S.it+1,parts,g,gid,rs:s,calc,gu}}
const stats=(S,P)=>{const n=S.parts.length,m=[0,1].map(d=>S.parts.reduce((a,p)=>a+p.x[d],0)/n),o=FN[P.fn].o;
 let cb=S.parts[0].f;S.parts.forEach(p=>{if(P.sgn*p.f<P.sgn*cb)cb=p.f});
 return{avg:S.parts.reduce((a,p)=>a+p.f,0)/n,cur:cb,div:S.parts.reduce((a,p)=>a+Math.hypot(p.x[0]-m[0],p.x[1]-m[1]),0)/n,dist:Math.hypot(S.g.x[0]-o[0],S.g.x[1]-o[1])}};
function run(P){const h=[init(P)];while(h.length<=P.T)h.push(step(h[h.length-1],P));return h}
if(typeof module!=='undefined')module.exports={FN,PRE,rnd,clamp,init,step,stats,run};
