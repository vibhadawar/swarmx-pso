// Run with: node tests/engine.test.js
const assert=require('assert');const {FN,init,step,run}=require('../js/engine.js');
let n=0;const t=(name,f)=>{f();n++;console.log('ok -',name)};
const close=(a,b,m)=>assert.ok(Math.abs(a-b)<1e-9,m+': '+a+' vs '+b);
const P0={fn:'sphere',w:.7,c1:1.5,c2:1.5,sgn:1,lo:-1e9,hi:1e9,vmax:1e9};
const S0=(o={})=>({it:0,rs:0,gid:0,g:{x:[0,0],f:0,...o.g},parts:[{x:[2,3],v:[.5,-.2],f:13,px:[1,1],pf:2,...o.p}]});
const FX=[{r1:[.4,.4],r2:[.6,.6]}];
t('velocity and position update (textbook example)',()=>{const p=step(S0(),P0,FX).parts[0];close(p.v[0],-2.05,'vx');close(p.v[1],-4.04,'vy');close(p.x[0],-.05,'x');close(p.x[1],-1.04,'y');close(p.f,1.0841,'f')});
t('pBest is updated when the new fitness is better',()=>{const p=step(S0(),P0,FX).parts[0];close(p.pf,1.0841,'pf');close(p.px[0],-.05,'px')});
t('pBest is kept when the new fitness is worse',()=>{const p=step(S0({p:{pf:1e-4}}),P0,FX).parts[0];close(p.pf,1e-4,'pf');assert.deepStrictEqual(p.px,[1,1])});
t('gBest is updated from the best pBest',()=>{const S=step(S0({g:{x:[0,0],f:162}}),P0,FX);close(S.g.f,1.0841,'g.f');assert.strictEqual(S.gu,true)});
t('maximization reverses the comparison',()=>{const p=step(S0(),{...P0,sgn:-1},FX).parts[0];close(p.pf,2,'pf')});
t('velocity limit clamps each component',()=>{const p=step(S0(),{...P0,vmax:1},FX).parts[0];assert.ok(p.v.every(v=>Math.abs(v)<=1))});
t('boundary clamp keeps positions inside and zeroes that velocity',()=>{const p=step(S0(),{...P0,lo:-1,hi:1,vmax:1e9},FX).parts[0];assert.ok(p.x.every(x=>x>=-1&&x<=1));close(p.x[1],-1,'y clamped to the bound');assert.strictEqual(p.v[1],0);close(p.v[0],-2.05,'x velocity untouched')});
t('same seed gives identical runs, different seeds differ',()=>{const Q={n:20,seed:7,fn:'sphere',lo:-5,hi:5,vi:1,vmax:2,w:.7,c1:1.5,c2:1.5,sgn:1,T:50};assert.strictEqual(JSON.stringify(run(Q)),JSON.stringify(run(Q)));assert.notStrictEqual(JSON.stringify(run(Q)),JSON.stringify(run({...Q,seed:8})))});
t('all five functions are 0 at their known optimum',()=>{[['sphere'],['rastrigin'],['rosenbrock'],['ackley'],['booth']].forEach(([k])=>assert.ok(Math.abs(FN[k].f(...FN[k].o))<1e-12,k))});
t('PSO converges on Sphere (30 particles, 100 iterations)',()=>{const h=run({n:30,seed:42,fn:'sphere',lo:-5,hi:5,vi:1,vmax:2,w:.7,c1:1.5,c2:1.5,sgn:1,T:100});assert.ok(h[100].g.f<1e-6)});
console.log(n+' tests passed');
