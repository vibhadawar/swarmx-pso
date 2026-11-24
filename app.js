// SwarmX UI: state, drawing, tabs, learning mode, outcomes. Needs engine.js loaded first.
const $=id=>document.getElementById(id);
// ---------- state ----------
let P,H,idx=0,sel=0,timer=null,view,hover=null,hm=null,draft={n:30,T:100,w:.7,c1:1.5,c2:1.5,vi:1,vmax:2,seed:42,lo:-5,hi:5};
const ST=H=>H.map((s,i)=>stats(s,P));let SS=[];
const f4=v=>Math.abs(v)>=1e4||(v!==0&&Math.abs(v)<1e-3)?v.toExponential(3):v.toFixed(4);
const fv=a=>'('+a.map(f4).join(', ')+')';
function ctl(){const defs=[['n','Particles',2,100,1],['T','Max iterations',1,500,1],['w','Inertia w',0,1.2,.05],['c1','Cognitive c1',0,4,.1],['c2','Social c2',0,4,.1],['vi','Initial velocity range ±',0,10,.1],['vmax','Velocity limit ±',.01,20,.1],['seed','Random seed',0,99999,1],['lo','Lower bound',-100,0,.01],['hi','Upper bound',0,100,.01]];
 $('pc').innerHTML=defs.map(([k,t,a,b,s])=>`<label>${t}: <b id="v_${k}"></b><input type=range id="r_${k}" min=${a} max=${b} step=${s}></label>`).join('');
 defs.forEach(([k])=>{const r=$('r_'+k);r.value=draft[k];$('v_'+k).textContent=draft[k];r.oninput=()=>{draft[k]=+r.value;$('v_'+k).textContent=r.value;if('w c1 c2'.includes(k))$('ps').value='Custom'}})}
function setFn(){const f=FN[$('fn').value];draft.lo=f.d[0];draft.hi=f.d[1];draft.vmax=+((f.d[1]-f.d[0])*.2).toFixed(2);ctl();$('fi').textContent=`f(x,y) = ${f.eq}. Domain [${f.d}], known minimum at (${f.o}) with f = ${$('fn').value==='ackley'?'0':'0'}.`}
function build(seed){if(seed!==undefined){draft.seed=seed;}P={...draft,fn:$('fn').value,sgn:+$('ob').value};H=run(P);SS=H.map(s=>stats(s,P));idx=0;sel=Math.min(sel,P.n-1);view={cx:(P.lo+P.hi)/2,cy:(P.lo+P.hi)/2,half:(P.hi-P.lo)/2*1.05};hm=null;ctl();draw()}
function go(){clearInterval(timer);timer=null;const sp=+$('sp').value;$('spv').textContent=sp;timer=setInterval(()=>{if(idx>=P.T){stop();return}idx++;draw()},1000/sp)}
function stop(){clearInterval(timer);timer=null}
// ---------- drawing ----------
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function sz(cv){const d=devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;cv.width=w*d;cv.height=h*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return[c,w,h]}
function line(cv,ser,log){const[c,w,h]=sz(cv);const tf=log?v=>Math.log10(Math.max(Math.abs(v),1e-12)):v=>v,al=ser.flatMap(s=>s.d.map(tf));if(!al.length)return;let a=Math.min(...al),b=Math.max(...al);if(a===b){a-=1;b+=1}
 c.strokeStyle=css('--ln');c.fillStyle=css('--mu');c.font='11px Manrope';c.strokeRect(34,4,w-40,h-20);c.fillText(b.toFixed(1),0,12);c.fillText(a.toFixed(1),0,h-20);
 const N=Math.max(...ser.map(s=>s.d.length))-1||1;ser.forEach(s=>{c.strokeStyle=s.c;c.lineWidth=2;c.beginPath();s.d.forEach((v,i)=>{const X=34+i/N*(w-40),Y=4+(1-(tf(v)-a)/(b-a))*(h-20);i?c.lineTo(X,Y):c.moveTo(X,Y)});c.stroke()});c.fillStyle=css('--mu');c.fillText('iteration 0 → '+N,40,h-4)}
const toS=(x,y,w)=>[(x-view.cx)/(2*view.half)*w+w/2,w/2-(y-view.cy)/(2*view.half)*w];
function heat(w){const k=P.fn+'|'+view.cx+'|'+view.cy+'|'+view.half;if(hm&&hm.k===k)return hm.c;const N=90,o=document.createElement('canvas');o.width=o.height=N;const c=o.getContext('2d'),im=c.createImageData(N,N),f=FN[P.fn].f,v=[];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)v.push(f(view.cx+((i+.5)/N*2-1)*view.half,view.cy-((j+.5)/N*2-1)*view.half));const a=Math.min(...v),b=Math.max(...v);
 v.forEach((q,i)=>{const t=Math.pow((q-a)/(b-a||1),.3);im.data.set(((u,A,B)=>[A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u,A[2]+(B[2]-A[2])*u,255])(t<.5?t*2:t*2-1,t<.5?[30,10,90]:[200,40,120],t<.5?[200,40,120]:[250,200,60]),i*4)});c.putImageData(im,0,0);hm={k,c:o};return o}
function draw2d(){const cv=$('cv'),[c,w]=sz(cv),S=H[idx];c.imageSmoothingEnabled=true;c.drawImage(heat(w),0,0,w,w);
 const[x0,y0]=toS(P.lo,P.hi,w),[x1,y1]=toS(P.hi,P.lo,w);c.strokeStyle='#fff8';c.setLineDash([5,4]);c.strokeRect(x0,y0,x1-x0,y1-y0);c.setLineDash([]);
 const o=toS(...FN[P.fn].o,w);c.strokeStyle=css('--ok');c.lineWidth=2;c.beginPath();c.moveTo(o[0],o[1]-8);c.lineTo(o[0]+8,o[1]);c.lineTo(o[0],o[1]+8);c.lineTo(o[0]-8,o[1]);c.closePath();c.stroke();
 S.parts.forEach((p,i)=>{c.strokeStyle=i===sel?'#fff':'#4cc9f066';c.lineWidth=i===sel?2:1;c.beginPath();for(let k=Math.max(0,idx-(i===sel?idx:30));k<=idx;k++){const[X,Y]=toS(...H[k].parts[i].x,w);k===Math.max(0,idx-(i===sel?idx:30))?c.moveTo(X,Y):c.lineTo(X,Y)}c.stroke()});
 S.parts.forEach((p,i)=>{const[X,Y]=toS(...p.x,w),[U,V]=toS(p.x[0]+p.v[0],p.x[1]+p.v[1],w);c.strokeStyle='#4cc9f0';c.lineWidth=1.2;c.beginPath();c.moveTo(X,Y);c.lineTo(U,V);c.stroke();
  const[a,b]=toS(...p.px,w);c.strokeStyle='#5be3a0';c.lineWidth=1.5;c.strokeRect(a-3,b-3,6,6);
  c.fillStyle='hsl('+(i*360/S.parts.length)+',90%,62%)';c.beginPath();c.arc(X,Y,i===sel?5:3.5,0,TAU);c.fill();if(i===sel){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(X,Y,9,0,TAU);c.stroke()}});
 const[gx,gy]=toS(...S.g.x,w);c.fillStyle=css('--gb');c.strokeStyle='#000';c.lineWidth=1;c.beginPath();for(let k=0;k<10;k++){const r=k%2?5:12,a=-Math.PI/2+k*Math.PI/5;c.lineTo(gx+r*Math.cos(a),gy+r*Math.sin(a))}c.closePath();c.fill();c.stroke();
 if(hover){const[X,Y]=hover,x=view.cx+(X/w-.5)*2*view.half,y=view.cy-(Y/w-.5)*2*view.half;let t=`x=${x.toFixed(3)}, y=${y.toFixed(3)}, f=${FN[P.fn].f(x,y).toFixed(3)}`;S.parts.forEach((p,i)=>{const[a,b]=toS(...p.x,w);if(Math.hypot(a-X,Y-b)<9)t=`Particle ${i}: ${fv(p.x)}, f=${f4(p.f)}`});$('tip').textContent=t}}
function panel(){const S=H[idx],s=SS[idx],pr=SS.slice(0,idx+1);
 $('stt').innerHTML=[['Iteration',idx+' / '+P.T],['Global best f',f4(S.g.f)],['Global best at',fv(S.g.x)],['Average f',f4(s.avg)],['Best particle','#'+S.gid+' (pBest holder)'],['Distance to optimum',f4(s.dist)],['Diversity',f4(s.div)],['Status',idx===0?'Initialized':s.div<(P.hi-P.lo)*1e-3?'Swarm collapsed':idx>20&&pr[idx-20].g!==undefined&&H[idx-20].g.f===S.g.f?'Stalled for 20+ iterations':'Improving']].map(([a,b])=>`<div><span class=mu>${a}</span><b>${b}</b></div>`).join('');
 line($('c1'),[{d:H.slice(0,idx+1).map(q=>q.g.f),c:css('--gb')},{d:pr.map(q=>q.avg),c:css('--ac')},{d:pr.map(q=>q.cur),c:css('--ok')}],true);line($('c2'),[{d:pr.map(q=>q.div),c:css('--ac')}],false);
 $('tb').innerHTML='<thead><tr><th>#</th><th>x</th><th>v</th><th>f</th><th>pBest f</th></tr></thead><tbody>'+S.parts.map((p,i)=>`<tr data-i=${i} class="${i===sel?'sel':''}"><td>${i}${i===S.gid?'★':''}</td><td>${fv(p.x)}</td><td>${fv(p.v)}</td><td>${f4(p.f)}</td><td>${f4(p.pf)}</td></tr>`).join('')+'</tbody>';
 const c=S.calc&&S.calc[sel],p=S.parts[sel];
 if(!c)$('cp').textContent=`Particle ${sel}, initialization\nPosition x(0) = ${fv(p.x)} drawn uniformly in [${P.lo}, ${P.hi}]\nVelocity v(0) = ${fv(p.v)} drawn in ±${P.vi}\nf = ${f4(p.f)}; pBest = its start position.\nPress Next to see the first update.`;
 else{const D=['x','y'],L=[];for(let d=0;d<2;d++)L.push(`${D[d]}: inertia ${P.w}×${f4(c.v0[d])} = ${f4(c.in[d])}\n   cognitive ${P.c1}×${f4(c.r1[d])}×(${f4(c.px[d])}−${f4(c.x0[d])}) = ${f4(c.co[d])}\n   social ${P.c2}×${f4(c.r2[d])}×(${f4(c.gx[d])}−${f4(c.x0[d])}) = ${f4(c.so[d])}\n   v = ${f4(c.in[d])} + ${f4(c.co[d])} + ${f4(c.so[d])} = ${f4(c.vr[d])}${c.clipV[d]?` → clamped to ${f4(c.v1[d])}`:''}\n   x = ${f4(c.x0[d])} + ${f4(c.v1[d])} = ${f4(c.xr[d])}${c.clipX[d]?` → outside bounds, set to ${f4(c.x1[d])}, velocity zeroed`:''}`);
  $('cp').textContent=`Particle ${sel}, iteration ${idx-1} → ${idx} (gBest used: ${fv(c.gx)})\n${L.join('\n')}\nNew position ${fv(c.x1)}, f = ${f4(c.f1)}\npBest ${c.up?'updated (better than '+f4(H[idx-1].parts[sel].pf)+')':'kept ('+f4(H[idx-1].parts[sel].pf)+')'}\ngBest ${S.gu?'updated this iteration':'unchanged'}: ${f4(S.g.f)}`}}
function draw(){draw2d();panel();const on=x=>$(x).classList.contains('on');if(on('t-3d'))plot3(false);if(on('t-learn'))learn();if(on('t-track'))track();if(idx>=P.T)award('sim')}
// ---------- hand calculation ----------
const HI={x:[[2,3],[-1,2]],v:[[.5,-.2],[0,.5]],pb:[[1,1],[-1,2]],g:[0,0],w:.7,c1:1.5,c2:1.5,r:[[.4,.4,.6,.6],[.4,.4,.6,.6]]};
function hform(){const q=(id,v)=>`<input type=number step=any id="${id}" value="${v}" style="width:68px">`;let h='';for(let i=0;i<2;i++)h+=`<p><b>Particle ${i+1}</b><br>x ${q('hx'+i+'0',HI.x[i][0])}${q('hx'+i+'1',HI.x[i][1])} v ${q('hv'+i+'0',HI.v[i][0])}${q('hv'+i+'1',HI.v[i][1])}<br>pBest ${q('hp'+i+'0',HI.pb[i][0])}${q('hp'+i+'1',HI.pb[i][1])} r1 (x, y) ${q('hr'+i+'0',HI.r[i][0])}${q('hr'+i+'1',HI.r[i][1])} r2 (x, y) ${q('hr'+i+'2',HI.r[i][2])}${q('hr'+i+'3',HI.r[i][3])}</p>`;
 $('hf').innerHTML=h+`<p>gBest ${q('hg0',HI.g[0])}${q('hg1',HI.g[1])}<br>w ${q('hw',HI.w)} c1 ${q('hc1',HI.c1)} c2 ${q('hc2',HI.c2)}</p>`}
const nv=id=>+$(id).value;
function hand(){const w=nv('hw'),c1=nv('hc1'),c2=nv('hc2'),g=[nv('hg0'),nv('hg1')],sph=(a,b)=>a*a+b*b;let out='Function: Sphere f = x² + y². gBest as given.\n',ok=true,Sx=[],fx=[];
 const pts=[0,1].map(i=>({x:[nv(`hx${i}0`),nv(`hx${i}1`)],v:[nv(`hv${i}0`),nv(`hv${i}1`)],px:[nv(`hp${i}0`),nv(`hp${i}1`)]}));
 pts.forEach((p,i)=>{const r1=[nv(`hr${i}0`),nv(`hr${i}1`)],r2=[nv(`hr${i}2`),nv(`hr${i}3`)];Sx.push({r1,r2});out+=`\nParticle ${i+1}\n`;const nx=[],nvv=[];
  for(let d=0;d<2;d++){const a=w*p.v[d],b=c1*r1[d]*(p.px[d]-p.x[d]),c=c2*r2[d]*(g[d]-p.x[d]),v=a+b+c,x=p.x[d]+v;nvv.push(v);nx.push(x);
   out+=`${'xy'[d]}: inertia = ${w}×${p.v[d]} = ${a.toFixed(6)}\n   cognitive = ${c1}×${r1[d]}×(${p.px[d]}−${p.x[d]}) = ${b.toFixed(6)}\n   social = ${c2}×${r2[d]}×(${g[d]}−${p.x[d]}) = ${c.toFixed(6)}\n   v = ${v.toFixed(6)}, x = ${p.x[d]} + ${v.toFixed(6)} = ${x.toFixed(6)}\n`}
  const f=sph(...nx),pf=sph(...p.px);fx.push({nx,nvv,f,pf});out+=`f(new) = ${f.toFixed(6)}; old pBest f = ${pf.toFixed(6)} → pBest ${f<pf?'updated':'kept'}\n`});
 const best=Math.min(...fx.map(q=>Math.min(q.f,q.pf)),sph(...g));out+=`\nBest of the new pBests and the old gBest = ${best.toFixed(6)} → gBest ${best<sph(...g)?'updated':'unchanged'}\n`;
 // engine run: huge bounds so no clamping, vmax huge
 const PE={fn:'sphere',w,c1,c2,sgn:1,lo:-1e9,hi:1e9,vmax:1e9},S0={it:0,rs:0,gid:0,g:{x:g,f:sph(...g)},parts:pts.map(p=>({x:p.x,v:p.v,f:sph(...p.x),px:p.px,pf:sph(...p.px)}))},S1=step(S0,PE,Sx);
 out+='\nEngine comparison (tolerance 1e-9)\n';S1.calc.forEach((c,i)=>{const e=Math.max(...[0,1].flatMap(d=>[Math.abs(c.v1[d]-fx[i].nvv[d]),Math.abs(c.x1[d]-fx[i].nx[d])]),Math.abs(c.f1-fx[i].f)),m=e<1e-9;ok=ok&&m&&c.up===(fx[i].f<fx[i].pf);out+=`Particle ${i+1}: engine v=${fv(c.v1)} x=${fv(c.x1)} f=${f4(c.f1)}, max difference ${e.toExponential(2)} ${m?'✔':'✘'}\n`});
 $('ho').innerHTML=out.replace(/&/g,'&amp;').replace(/</g,'&lt;')+`\n<span class="${ok?'ok':'bad'}">${ok?'MATCH: hand calculation and engine agree.':'MISMATCH between hand calculation and engine.'}</span>`}
// ---------- compare ----------
let CR=null;
function cmp(){const cfg=(a,b,c)=>({...draft,fn:$('fn').value,sgn:+$('ob').value,w:nv(a),c1:nv(b),c2:nv(c)}),A=cfg('aw','a1','a2'),B=cfg('bw','b1','b2'),rA=run(A),rB=run(B);
 const mk=(r,p)=>{const s=r.map(q=>stats(q,p)),th=1e-3,it=r.findIndex(q=>q.g.f<=th);return{g:r.map(q=>q.g.f),div:s.map(q=>q.div),fin:r[r.length-1].g.f,it,fd:s[s.length-1].div,dist:s[s.length-1].dist}};
 const a=mk(rA,A),b=mk(rB,B);CR={a,b};line($('c3'),[{d:a.g,c:css('--gb')},{d:b.g,c:css('--ac')}],true);
 const d=x=>x.it<0?'did not reach 1e-3':'reached 1e-3 at iteration '+x.it,win=a.fin===b.fin?'tied':(a.fin<b.fin?'A':'B');
 $('co').textContent=`A (gold): w=${A.w}, c1=${A.c1}, c2=${A.c2}: final best ${f4(a.fin)}, ${d(a)}, final diversity ${f4(a.fd)}.\nB (blue): w=${B.w}, c1=${B.c1}, c2=${B.c2}: final best ${f4(b.fin)}, ${d(b)}, final diversity ${f4(b.fd)}.\nResult on ${FN[A.fn].n}, seed ${A.seed}: ${win==='tied'?'both ended equal':'configuration '+win+' finished with the lower value'}. ${a.fd>b.fd?'A kept the swarm more spread out (more exploration).':'B kept the swarm more spread out (more exploration).'} One seed is only one sample; change the seed and rerun before drawing conclusions.`}
function dl(name,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv'}));a.download=name;a.click()}
// ---------- 3D ----------
let plotly=null;
function plot3(full){if(!window.Plotly){if(!plotly){plotly=1;const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.35.2/plotly.min.js';s.onload=()=>plot3(true);s.onerror=()=>{$('p3m').textContent='Plotly could not load; check your connection.'};document.head.appendChild(s)}return}
 const f=FN[P.fn],N=60,xs=[],ys=[];for(let i=0;i<N;i++){xs.push(P.lo+i/(N-1)*(P.hi-P.lo));ys.push(P.lo+i/(N-1)*(P.hi-P.lo))}
 const S=H[idx],t=[{type:'surface',x:xs,y:ys,z:ys.map(y=>xs.map(x=>f.f(x,y))),colorscale:'Plasma',opacity:.9,showscale:false},
 {type:'scatter3d',mode:'markers',x:S.parts.map(p=>p.x[0]),y:S.parts.map(p=>p.x[1]),z:S.parts.map(p=>p.f),marker:{size:4,color:'#ff4d6d'},name:'particles'},
 {type:'scatter3d',mode:'markers',x:[S.g.x[0]],y:[S.g.x[1]],z:[S.g.f],marker:{size:8,color:'#ffb703',symbol:'diamond'},name:'gBest'},
 {type:'scatter3d',mode:'markers',x:[f.o[0]],y:[f.o[1]],z:[f.f(...f.o)],marker:{size:6,color:'#5be3a0'},name:'optimum'}];
 const lay={margin:{l:0,r:0,t:0,b:0},paper_bgcolor:'rgba(0,0,0,0)',font:{color:css('--tx')},scene:{xaxis:{title:'x'},yaxis:{title:'y'},zaxis:{title:'f(x,y)'}},showlegend:false};
 Plotly.react('p3',t,lay,{responsive:true});$('p3m').textContent=`${f.n}: red = particles at iteration ${idx}, gold = global best, green = known optimum. Use the Simulator to move the swarm.`}
// ---------- learning, tracking, saved runs ----------
let ls=0,lmode='b';
const LS=[['Initialize the swarm','x_i(0) = lo + rand·(hi − lo), per dimension','Drop every particle at a random spot, like scattering scouts over an unexplored field.','A spread-out start samples the whole landscape, so the swarm has something to compare.','init(): uniform draws from a seeded generator.'],
['Initialize velocities','v_i(0) = uniform in [−vi, +vi]','Give each scout a random first push in a random direction.','Velocity is what lets a particle keep moving between decisions.','Same generator, so one seed reproduces the whole run.'],
['Evaluate the objective','f_i = f(x_i)','Ask the landscape how good each spot is. Lower is better when minimizing.','Everything that follows compares these scores.','f is called once per particle per iteration: N·T evaluations in total.'],
['Update personal best','if f_i is better than the stored pBest value, pBest_i = x_i','Each scout remembers the best place it has personally found.','This memory is the cognitive pull that draws a particle back to its own good spots.','Strict comparison, using the sign for minimize or maximize.'],
['Update global best','gBest = best of all pBest','The swarm keeps one shared notice board with the best place anyone has found.','This is the social pull, so good news spreads to everyone.','Updated only when a pBest is strictly better than the stored gBest.'],
['Inertia contribution','w·v_i(t)','Keep going the way you were going, scaled by w.','Higher w keeps momentum and favors exploration; lower w favors fine local search.','Computed per dimension from the stored velocity.'],
['Cognitive contribution','c1·r1·(pBest_i − x_i)','Pull toward your own best spot by a random amount.','Lets each particle learn from its own history.','r1 is drawn fresh for every particle and dimension.'],
['Social contribution','c2·r2·(gBest − x_i)','Pull toward the swarm’s best spot by a random amount.','Spreads discoveries through the swarm.','Every particle reads the gBest saved at the end of the previous iteration.'],
['Update velocity','v(t+1) = inertia + cognitive + social, then clamp to ±vmax','Add the three pushes into one new velocity, and cap the speed.','The cap stops particles from overshooting the whole search space.','Component-wise clamp to [−vmax, vmax].'],
['Update position','x(t+1) = x(t) + v(t+1), then clamp to the bounds','Move by the new velocity. If you hit a wall, stop at the wall.','Keeps every candidate inside the allowed search space.','Boundary strategy: clamp the position and set that velocity component to 0.'],
['Check termination','stop when t ≥ T','Stop once the iteration budget is used up.','Without a limit the loop would never end; this tool uses a fixed iteration count.','Other common stops: a target error, or a stalled gBest.'],
['Repeat','t ← t + 1, go back to step 3','Do it all again from the new positions.','Repeated cycles are what gradually move the swarm toward good regions.','Every iteration is stored in history, which is why Previous works.']];
function pick(id){const s=$(id);if(s.options.length!==P.n)s.innerHTML=Array.from({length:P.n},(_,j)=>`<option>${j}</option>`).join('');s.value=sel}
function learn(){if(!P)return;pick('lps');const k=Math.max(idx,1),i=sel,A=H[k-1].parts[i],B=H[k].parts[i],c=H[k].calc[i],g0=H[k-1].g,e=lmode==='e',t=LS[ls];let v;
 switch(ls){case 0:v=`Particle ${i} starts at ${fv(H[0].parts[i].x)}`;break;
 case 1:v=`Particle ${i} starts with velocity ${fv(H[0].parts[i].v)}`;break;
 case 2:v=`f${fv(A.x)} = ${f4(A.f)}`;break;
 case 3:v=`Before: pBest f = ${f4(A.pf)}. New f = ${f4(c.f1)}. After: pBest f = ${f4(B.pf)}, so pBest was ${c.up?'updated':'kept'}.`;break;
 case 4:v=`Before: gBest f = ${f4(g0.f)} at ${fv(g0.x)}.\nAfter: gBest f = ${f4(H[k].g.f)} at ${fv(H[k].g.x)}, so gBest was ${H[k].gu?'updated':'unchanged'}.`;break;
 case 5:v=`w × v = ${P.w} × ${fv(c.v0)} = ${fv(c.in)}`;break;
 case 6:v=`r1 = ${fv(c.r1)}; pBest − x = ${fv([c.px[0]-c.x0[0],c.px[1]-c.x0[1]])}\nc1 × r1 × (pBest − x) = ${fv(c.co)}`;break;
 case 7:v=`r2 = ${fv(c.r2)}; gBest − x = ${fv([c.gx[0]-c.x0[0],c.gx[1]-c.x0[1]])}\nc2 × r2 × (gBest − x) = ${fv(c.so)}`;break;
 case 8:v=`Sum = ${fv(c.vr)}${c.clipV.some(Boolean)?', clamped to '+fv(c.v1):''}\nVelocity before ${fv(c.v0)} → after ${fv(c.v1)}`;break;
 case 9:v=`Position before ${fv(c.x0)} → after ${fv(c.x1)}${c.clipX.some(Boolean)?' (hit a boundary: clamped, velocity zeroed)':''}`;break;
 case 10:v=`Iteration ${k} of ${P.T}: ${k>=P.T?'limit reached, stop.':'limit not reached, continue.'}`;break;
 default:v=`t becomes ${k+1}; go back to step 3. Particles are processed one after another, and all of them use the gBest from the end of the previous iteration.`}
 $('lh').textContent=`Showing iteration ${k-1} → ${k}. Particle ${i} of ${P.n} is the one being processed, and it is highlighted in the Simulator. All values come from the real run.`;
 $('lo').textContent=e?`Step ${ls+1} of 12: ${t[0]}\n\nEquation: ${t[1]}\n\nParticle ${i}:\n${v}\n\nImplementation: ${t[4]}`:`Step ${ls+1} of 12: ${t[0]}\n\n${t[2]}\n\nWhy it matters: ${t[3]}\n\nParticle ${i}:\n${v}`}
function track(){if(!P)return;pick('tps');let h='<thead><tr><th>t</th><th>x</th><th>v</th><th>f</th><th>pBest x</th><th>pBest f</th><th>pBest updated</th><th>dist to gBest</th></tr></thead><tbody>';
 for(let k=0;k<=idx;k++){const p=H[k].parts[sel],up=k===0?'start':H[k].calc[sel].up?'yes':'no';h+=`<tr><td>${k}</td><td>${fv(p.x)}</td><td>${fv(p.v)}</td><td>${f4(p.f)}</td><td>${fv(p.px)}</td><td>${f4(p.pf)}</td><td>${up}</td><td>${f4(Math.hypot(p.x[0]-H[k].g.x[0],p.x[1]-H[k].g.x[1]))}</td></tr>`}
 $('tt').innerHTML=h+'</tbody>';const[c,w]=sz($('ct'));c.drawImage(heat(w),0,0,w,w);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();
 for(let k=0;k<=idx;k++){const[X,Y]=toS(...H[k].parts[sel].x,w);k?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke();
 const[a,b]=toS(...H[0].parts[sel].x,w),[d,e]=toS(...H[idx].parts[sel].x,w),[gx,gy]=toS(...H[idx].g.x,w);c.fillStyle='#5be3a0';c.beginPath();c.arc(a,b,6,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(d,e,5,0,TAU);c.fill();c.fillStyle=css('--gb');c.font='20px sans-serif';c.fillText('★',gx-8,gy+7)}
const SK='swarmx_saves',esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const gs=()=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch(e){return[]}},ps=a=>{try{localStorage.setItem(SK,JSON.stringify(a));return true}catch(e){return false}};
function saves(){const a=gs();$('sl').innerHTML=a.length?a.map((s,i)=>`<div class=row><b>${esc(s.name)}</b><span class=mu>${FN[s.fn].n}, ${s.sgn>0?'minimize':'maximize'}, w=${s.d.w}, c1=${s.d.c1}, c2=${s.d.c2}, n=${s.d.n}, seed ${s.d.seed}</span><button data-a=load data-i=${i}>Load</button><button data-a=play data-i=${i}>Replay</button><button data-a=del data-i=${i}>Delete</button></div>`).join(''):'<p class=mu>Nothing saved yet. Set up a run in the Simulator, then save it here.</p>'}
$('sv').onclick=()=>{award('save');const a=gs(),d={};'n T w c1 c2 vi vmax seed lo hi'.split(' ').forEach(k=>d[k]=P[k]);a.push({name:$('sn').value||'Run '+(a.length+1),fn:P.fn,sgn:P.sgn,d});if(!ps(a))alert('This browser blocked local storage, so the run could not be saved.');$('sn').value='';saves()};
$('sl').onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=gs(),s=a[+b.dataset.i];if(b.dataset.a==='del'){a.splice(+b.dataset.i,1);ps(a);saves();return}
 Object.assign(draft,s.d);$('fn').value=s.fn;$('ob').value=s.sgn;stop();build();document.querySelector('[data-t=sim]').click();if(b.dataset.a==='play'){idx=0;draw();go()}};
$('lb').onclick=()=>{lmode='b';$('lb').classList.add('on');$('le').classList.remove('on');learn()};$('le').onclick=()=>{lmode='e';$('le').classList.add('on');$('lb').classList.remove('on');learn()};
$('lp1').onclick=()=>{ls=(ls+11)%12;lsSeen.add(ls);learn();if(lsSeen.size>=12)award('learn')};$('ln').onclick=()=>{ls=(ls+1)%12;lsSeen.add(ls);learn();if(lsSeen.size>=12)award('learn')};$('li').onclick=()=>{if(idx<P.T)idx++;learn()};
$('lps').onchange=()=>{sel=+$('lps').value;learn()};$('tps').onchange=()=>{sel=+$('tps').value;track()};
$('tcsv').onclick=()=>{let t='iteration,x,y,vx,vy,fitness,pbest_x,pbest_y,pbest_f,pbest_updated,dist_to_gbest\n';for(let k=0;k<=idx;k++){const p=H[k].parts[sel];t+=[k,...p.x,...p.v,p.f,...p.px,p.pf,k?H[k].calc[sel].up:'',Math.hypot(p.x[0]-H[k].g.x[0],p.x[1]-H[k].g.x[1])].join(',')+'\n'}dl('swarmx_particle_'+sel+'.csv',t)};
// ---------- outcomes, quiz, challenge ----------
const lsSeen=new Set([0]),got=(()=>{try{return JSON.parse(localStorage.getItem('swarmx_out')||'{}')}catch(e){return{}}})();
const OC=[['sim','describe how a swarm moves and settles over iterations','Run a simulation to its final iteration'],['learn','list the 12 steps of PSO in order','Visit all 12 steps in Learning mode'],['calc','compute a velocity update from inertia, cognitive and social terms','Select a particle in the Simulator table'],['hand','verify the algorithm by hand calculation','Get a MATCH in Hand calculation'],['cmp','explain how w and c1/c2 change exploration and exploitation','Run a comparison of two configurations'],['track','follow one particle’s history and its pBest updates','Open Particle tracking'],['3d','relate landscape shape to optimization difficulty','Open the 3D landscape'],['save','reproduce an experiment from its seed','Save a run in Saved runs'],['quiz','answer core PSO concept questions','Score 6 or more out of 8 in the knowledge check'],['chal','tune parameters so PSO succeeds reliably','Pass the challenge with at least 50% successful runs']];
function award(k){if(got[k])return;got[k]=1;try{localStorage.setItem('swarmx_out',JSON.stringify(got))}catch(e){}const t=$('toast');t.textContent='Outcome unlocked: '+OC.find(o=>o[0]===k)[1];t.style.display='block';setTimeout(()=>t.style.display='none',3000);if($('t-out').classList.contains('on'))outcomes()}
function outcomes(){const n=OC.filter(o=>got[o[0]]).length;$('oc').innerHTML=OC.map(o=>`<div class="oi ${got[o[0]]?'d':''}"><span>${got[o[0]]?'✅':'⬜'}</span><div><b>You can ${o[1]}</b><div class=mu>Activity: ${o[2]}</div></div></div>`).join('');$('ob2').style.width=n/OC.length*100+'%';$('op').textContent=n+' of '+OC.length+' outcomes achieved'+(n===OC.length?'. All done, well done!':'')}
const QZ=[['What does a higher inertia weight w mainly encourage?',['Exploration','Local exploitation','Smaller swarms','Tighter bounds'],0,'A larger w keeps momentum, so particles keep travelling; a smaller w favors fine local search.'],['What does the coefficient c1 control?',['Pull toward the particle’s own best position','Pull toward the swarm’s best position','The maximum velocity','The number of particles'],0,'c1 is the cognitive coefficient: individual memory.'],['What does the coefficient c2 control?',['Random seed','Pull toward the swarm’s best position','Boundary size','Inertia'],1,'c2 is the social coefficient: attraction to gBest.'],['Which update gives the new position?',['x(t+1) = x(t) + v(t+1)','x(t+1) = w·x(t)','x(t+1) = gBest','x(t+1) = v(t)'],0,'The position moves by the freshly updated velocity.'],['Which function best shows the problem of local minima?',['Sphere','Rastrigin','Booth','None of them'],1,'Rastrigin has a grid of local minima around the global one.'],['Does any choice of w, c1 and c2 guarantee finding the global optimum?',['Yes, w = 0.7','Yes, with enough particles','No','Only on Sphere'],2,'PSO is a heuristic; no setting guarantees convergence.'],['What is gBest?',['The best pBest found by any particle','The average position','A random particle','The last particle’s position'],0,'gBest is the best personal best across the swarm.'],['What is the role of r1 and r2?',['Random numbers that add stochastic variation','Constants that sum to 1','Velocity limits','Bounds of the search space'],0,'Fresh random numbers in [0,1] make each move different.']];
let qi=0,qs=0,qa=false;
function quiz(){const el=$('qz');if(qi>=QZ.length){const ok=qs>=6;if(ok)award('quiz');el.innerHTML=`<h3>Score: ${qs} / ${QZ.length}</h3><p>${ok?'Great, outcome achieved.':'Aim for 6 or more, then try again.'}</p><button id="qr" class="pri">Try again</button>`;$('qr').onclick=()=>{qi=0;qs=0;quiz()};return}
 const q=QZ[qi];qa=false;el.innerHTML=`<div class=mu>Question ${qi+1} of ${QZ.length}</div><p><b>${q[0]}</b></p><div class=q>${q[1].map((o,j)=>`<button data-j=${j}>${o}</button>`).join('')}</div><div id="qf"></div>`;
 el.querySelector('.q').onclick=e=>{const b=e.target.closest('button');if(!b||qa)return;qa=true;const j=+b.dataset.j;if(j===q[2])qs++;[...el.querySelectorAll('.q button')].forEach((x,m)=>{if(m===q[2])x.style.borderColor='var(--ok)';else if(m===j)x.style.borderColor='var(--bad)'});$('qf').innerHTML=`<p>${j===q[2]?'✅ Correct. ':'❌ Not quite. '}${q[3]}</p><button id="qn" class="pri">Next</button>`;$('qn').onclick=()=>{qi++;quiz()}}}
$('ch').onclick=()=>{const R=[];for(let s=1;s<=20;s++){const h=run({...P,seed:s*7919,sgn:1}),it=h.findIndex(q=>q.g.f<=1e-3);R.push({it,f:h[h.length-1].g.f})}
 const ok=R.filter(r=>r.it>=0),rate=ok.length/20,med=a=>{const b=[...a].sort((x,y)=>x-y),m=b.length>>1;return b.length?(b.length%2?b[m]:(b[m-1]+b[m])/2):NaN},its=ok.map(r=>r.it);
 $('cho').textContent=`${FN[P.fn].n}, ${P.n} particles, ${P.T} iterations, w=${P.w}, c1=${P.c1}, c2=${P.c2}\nSuccessful runs: ${ok.length} of 20 (${(rate*100).toFixed(0)}%)\nMedian iterations to success: ${ok.length?med(its):'none succeeded'}\nMedian final best value: ${f4(med(R.map(r=>r.f)))}\n${rate>=.5?'Challenge passed: at least half the runs succeeded.':'Not yet. Change the parameters, press Apply and reset in the Simulator, and run again.'}`;if(rate>=.5)award('chal')};
quiz();
// ---------- wiring ----------
const tabs=[['sim','Simulator'],['learn','Learning mode'],['track','Particle tracking'],['saved','Saved runs'],['out','Outcomes'],['hand','Hand calculation'],['cmp','Compare'],['3d','3D landscape'],['th','Theory']];
$('nav').innerHTML=tabs.map(([k,t],i)=>`<button data-t=${k} class="${i?'':'on'}">${t}</button>`).join('');
$('nav').onclick=e=>{const k=e.target.dataset.t;if(!k)return;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.id==='t-'+k));[...$('nav').children].forEach(b=>b.classList.toggle('on',b.dataset.t===k));if(k==='sim')draw();if(k==='learn')learn();if(k==='track'){track();award('track')}if(k==='saved')saves();if(k==='out')outcomes();if(k==='3d'){plot3(true);award('3d')}if(k==='cmp'&&!CR)cmp()};
$('fn').innerHTML=Object.entries(FN).map(([k,v])=>`<option value=${k}>${v.n}</option>`).join('');
$('fn').onchange=()=>{stop();setFn();build()};$('ob').onchange=()=>{stop();build()};
$('ps').onchange=()=>{const p=PRE[$('ps').value];if(p){[draft.w,draft.c1,draft.c2]=p;ctl()}};
$('rs').onclick=$('rs2').onclick=()=>{stop();build()};$('rn').onclick=()=>{stop();draft.seed=Math.floor(Math.random()*99999);build()};
$('pl').onclick=()=>{if(idx>=P.T)idx=0;go()};$('pa').onclick=stop;$('sp').oninput=()=>{$('spv').textContent=$('sp').value;if(timer)go()};
$('nx').onclick=()=>{stop();if(idx<P.T)idx++;draw()};$('pv').onclick=()=>{stop();if(idx>0)idx--;draw()};
$('tb').onclick=e=>{const r=e.target.closest('tr');if(r&&r.dataset.i!==undefined){sel=+r.dataset.i;award('calc');draw()}};
$('csv').onclick=()=>{let t='iteration,particle,x,y,vx,vy,fitness,pbest_f,gbest_f\n';H.slice(0,idx+1).forEach(s=>s.parts.forEach((p,i)=>{t+=[s.it,i,...p.x,...p.v,p.f,p.pf,s.g.f].join(',')+'\n'}));dl('swarmx_run.csv',t)};
$('cx').onclick=()=>{if(!CR)return;let t='iteration,A_gbest,B_gbest,A_diversity,B_diversity\n';CR.a.g.forEach((v,i)=>{t+=[i,v,CR.b.g[i],CR.a.div[i],CR.b.div[i]].join(',')+'\n'});dl('swarmx_compare.csv',t)};
$('cr').onclick=()=>{cmp();award('cmp')};$('hc').onclick=()=>{hand();if($('ho').querySelector('.ok'))award('hand')};$('hx').onclick=()=>{hform();hand();if($('ho').querySelector('.ok'))award('hand')};
$('th').onclick=()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';hm=null;draw();if(CR)cmp()};
const cv=$('cv');let drag=null;
cv.onmousemove=e=>{const r=cv.getBoundingClientRect();hover=[e.clientX-r.left,e.clientY-r.top];if(drag){const w=r.width,k=2*view.half/w;view.cx-=(e.clientX-drag[0])*k;view.cy+=(e.clientY-drag[1])*k;drag=[e.clientX,e.clientY]}draw2d();const t=$('tip');t.style.display='block';t.style.left=e.clientX+12+'px';t.style.top=e.clientY+12+'px'};
cv.onmousedown=e=>{drag=[e.clientX,e.clientY]};addEventListener('mouseup',()=>drag=null);cv.onmouseleave=()=>{hover=null;$('tip').style.display='none';draw2d()};
cv.onwheel=e=>{e.preventDefault();view.half*=e.deltaY>0?1.12:.89;draw2d()};
addEventListener('resize',()=>{if($('t-sim').classList.contains('on'))draw()});
setFn();hform();build();hand();
