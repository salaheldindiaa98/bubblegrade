/* BubbleGrade optical mark recognition. Local image processing; no image upload. */
(function(root){
'use strict';
function template(n=20,options=5){
 const cols=n<=50?2:4, rows=Math.ceil(n/cols), dx=cols===4?25:38, pitch=cols===4?181:350, dy=Math.min(50,680/rows), r=cols===4?8:11;
 const t={name:`BubbleGrade ${n}`,w:800,h:1132,options,markers:[[40,40],[760,40],[760,1092],[40,1092]],questions:[],native:true};
 for(let i=0;i<n;i++){const c=Math.floor(i/rows),row=i%rows;t.questions.push({bubbles:Array.from({length:options},(_,j)=>[cols===4?94+c*pitch+j*dx:145+c*pitch+j*dx,310+row*dy]),r});}return t;
}
function solve(A,b){A=A.map((v,i)=>[...v,b[i]]);for(let i=0;i<b.length;i++){let k=i;for(let j=i+1;j<b.length;j++)if(Math.abs(A[j][i])>Math.abs(A[k][i]))k=j;[A[i],A[k]]=[A[k],A[i]];let d=A[i][i];if(Math.abs(d)<1e-9)throw Error('Reference points are too close or on a line.');for(let j=i;j<=b.length;j++)A[i][j]/=d;for(let k=0;k<b.length;k++)if(k!==i){d=A[k][i];for(let j=i;j<=b.length;j++)A[k][j]-=d*A[i][j];}}return A.map(r=>r[b.length]);}
function homography(src,dst){let A=[],b=[];src.forEach(([x,y],i)=>{let[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);b.push(u,v);});return [...solve(A,b),1];}
function project(H,x,y){const d=H[6]*x+H[7]*y+1;return[(H[0]*x+H[1]*y+H[2])/d,(H[3]*x+H[4]*y+H[5])/d];}
function gray(image){let d=image.data,o=new Uint8Array(image.width*image.height);for(let i=0;i<o.length;i++)o[i]=Math.round(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114);return o;}
function markers(image){const{width:w,height:h}=image,g=gray(image),seen=new Uint8Array(w*h),queue=new Int32Array(w*h),out=[];
 for(let p=0;p<g.length;p++){if(seen[p]||g[p]>95)continue;let head=0,tail=1;queue[0]=p;seen[p]=1;let minX=w,maxX=0,minY=h,maxY=0,count=0;while(head<tail){let v=queue[head++],x=v%w,y=(v/w)|0;count++;minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);for(let z of[v-1,v+1,v-w,v+w]){if(z<0||z>=g.length||seen[z]||g[z]>95||Math.abs(z%w-x)>1)continue;seen[z]=1;queue[tail++]=z;}}
 let bw=maxX-minX+1,bh=maxY-minY+1;if(count>25&&bw>4&&bh>4&&bw<w*.09&&bh<h*.09&&bw/bh>.55&&bw/bh<1.8&&count/(bw*bh)>.73)out.push({x:(minX+maxX)/2,y:(minY+maxY)/2,area:count});}
 if(out.length<4)return null;let corners=[[0,0],[w,0],[w,h],[0,h]].map(([cx,cy])=>out.filter(p=>(cx===0?p.x<w*.5:p.x>w*.5)&&(cy===0?p.y<h*.5:p.y>h*.5)).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy))[0]);if(corners.some(p=>!p))return null;const pts=corners.map(p=>[p.x,p.y]);if(Math.min(pts[1][0]-pts[0][0],pts[2][0]-pts[3][0])<w*.24||Math.min(pts[3][1]-pts[0][1],pts[2][1]-pts[1][1])<h*.24)return null;const areas=corners.map(p=>p.area);if(Math.max(...areas)/Math.min(...areas)>5)return null;return pts;
}
// Live camera: search near the four calibrated targets and adapt to local contrast.
// A fixed dark cutoff misses softened gray registration squares in real phone video.
function guidedMarkers(image,{targets,radius,minSpan=.24,aspectRatio=null}){
 const {width:w,height:h}=image,g=gray(image),groups=[];
 for(const [tx,ty] of targets){
  const x0=Math.max(0,Math.floor(tx-radius)),y0=Math.max(0,Math.floor(ty-radius)),x1=Math.min(w-1,Math.ceil(tx+radius)),y1=Math.min(h-1,Math.ceil(ty+radius)),rw=x1-x0+1,rh=y1-y0+1;
  const hist=new Uint32Array(256);let total=0,sum=0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const v=g[y*w+x];hist[v]++;total++;sum+=v;}
  // Otsu threshold in this small window separates the mark from its nearby paper.
  let n=0,s=0,best=0,cut=0;for(let v=0;v<255;v++){n+=hist[v];s+=v*hist[v];if(!n||n===total)continue;const variance=n*(total-n)*(s/n-(sum-s)/(total-n))**2;if(variance>best){best=variance;cut=v;}}
  let bright=255,acc=0;for(let v=0;v<256;v++){acc+=hist[v];if(acc>=total*.8){bright=v;break;}}
  cut=Math.min(cut,bright-32);if(!best||bright-cut<14)return null;
  const candidates=[];
  for(const threshold of [cut,cut-16,cut-32,cut-48,cut-64]){
  if(threshold<0)continue;
  // Use the original dark components. Closing gaps joins barcode stripes into
  // convincing fake squares and shifts every bubble in the perspective transform.
  const closed=new Uint8Array(rw*rh);
  for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)closed[y*rw+x]=g[(y+y0)*w+x+x0]<=threshold?1:0;
  const seen=new Uint8Array(rw*rh),queue=new Int32Array(rw*rh);
  for(let j=0;j<seen.length;j++){
   if(seen[j]||!closed[j])continue;
   let head=0,tail=1,count=0,minX=rw,maxX=0,minY=rh,maxY=0,dark=0;queue[0]=j;seen[j]=1;
   while(head<tail){const q=queue[head++],x=q%rw,y=q/rw|0;count++;dark+=g[(y+y0)*w+x+x0];minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(nx<0||ny<0||nx>=rw||ny>=rh)continue;const z=ny*rw+nx;if(!seen[z]&&closed[z]){seen[z]=1;queue[tail++]=z;}}
   }
   const bw=maxX-minX+1,bh=maxY-minY+1,fill=count/(bw*bh),aspect=bw/bh,cx=x0+(minX+maxX)/2,cy=y0+(minY+maxY)/2;
   if(count<16||bw<4||bh<4||bw>radius*.8||bh>radius*.8||aspect<.55||aspect>1.8||fill<.73||minX===0||minY===0||maxX===rw-1||maxY===rh-1)continue;
   // Hollow printed boxes and low-contrast patches must not become registration marks.
   let ring=0,rn=0;const pad=Math.max(2,Math.round(Math.min(bw,bh)*.35));for(let y=Math.max(y0,minY+y0-pad);y<=Math.min(y1,maxY+y0+pad);y++)for(let x=Math.max(x0,minX+x0-pad);x<=Math.min(x1,maxX+x0+pad);x++){if(x<minX+x0||x>maxX+x0||y<minY+y0||y>maxY+y0){ring+=g[y*w+x];rn++;}}
   const contrast=ring/Math.max(1,rn)-dark/count;if(contrast<20)continue;
   candidates.push({x:cx,y:cy,area:count,quality:fill+Math.min(1,contrast/80)-Math.hypot(cx-tx,cy-ty)/radius});
  }
  }
  candidates.sort((a,b)=>b.quality-a.quality);const unique=[];for(const v of candidates)if(!unique.some(a=>Math.hypot(v.x-a.x,v.y-a.y)<Math.max(4,Math.sqrt(Math.min(v.area,a.area))*.5)))unique.push(v);
  if(!unique.length)return null;groups.push(unique.slice(0,8));
 }
 // Select a coherent set together: an isolated barcode fragment must not beat
 // the real bottom square merely because it is closer to a target.
 let chosen=null,bestQuality=-Infinity;
 for(const a of groups[0])for(const b of groups[1])for(const c of groups[2])for(const d of groups[3]){
  const set=[a,b,c,d],areas=set.map(v=>v.area),areaRatio=Math.max(...areas)/Math.min(...areas);
  if(areaRatio>5||Math.min(b.x-a.x,c.x-d.x)<w*minSpan||Math.min(d.y-a.y,c.y-b.y)<h*minSpan)continue;
  const top=Math.hypot(b.x-a.x,b.y-a.y),bottom=Math.hypot(c.x-d.x,c.y-d.y),left=Math.hypot(d.x-a.x,d.y-a.y),right=Math.hypot(c.x-b.x,c.y-b.y);
  const skew=Math.abs(Math.log(top/bottom))+Math.abs(Math.log(left/right))+Math.abs((b.y-a.y)-(c.y-d.y))/Math.max(left,right);
  const shape=aspectRatio?Math.abs(Math.log((top+bottom)/(left+right)/aspectRatio)):0;
  const quality=set.reduce((n,v)=>n+v.quality,0)/4-2*skew-.2*(areaRatio-1)-12*shape;
  if(quality>bestQuality){bestQuality=quality;chosen=set.map(v=>[v.x,v.y]);}
 }
 return chosen;
}

function markerAspect(t){
 const [a,b,c,d]=t.markers,dist=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1]);
 return (dist(a,b)+dist(d,c))/(dist(a,d)+dist(b,c));
}
// Re-find saved corners, including a nearby real square below a mistaken barcode.
function refindMarkers(image,t,points){
 if(!Array.isArray(points)||points.length!==4)return null;
 return guidedMarkers(image,{targets:points,radius:Math.max(24,Math.min(image.width*.25,Math.min(image.width,image.height)*.18)),minSpan:.12,aspectRatio:markerAspect(t)});
}
// Re-reading is a new optical estimate, not a reason to discard an instructor's decisions.
function rereadResult(result,answers,points,threshold,preserve=true){
 const next=answers.map((a,i)=>({...a,resolved:preserve?(result.answers[i]?.resolved??null):null,credit:preserve?(result.answers[i]?.credit??null):null}));
 const blanks=list=>list.map((a,i)=>a.state==='blank'&&a.resolved==null&&a.credit==null?i:-1).filter(i=>i>=0).join(',');
 const keepBlanks=preserve&&blanks(result.answers)===blanks(next);
 return {...result,answers:next,points,threshold,blankReviewed:keepBlanks&&!!result.blankReviewed,blankCredit:keepBlanks?(result.blankCredit||0):0,updatedAt:new Date().toISOString()};
}
function analyze(image,t,pts,threshold=.3){
 const H=homography(t.markers,pts),g=gray(image),w=image.width,h=image.height;
 function sample(x,y){let[a,b]=project(H,x,y);a=Math.round(a);b=Math.round(b);return a<0||b<0||a>=w||b>=h?255:g[b*w+a];}
 let clipped=0;
 const answers=t.questions.map(q=>{const ratios=q.bubbles.map(([x,y],bubbleIndex)=>{const r=q.r;let inside=[],outside=[];for(let iy=-6;iy<=6;iy++)for(let ix=-6;ix<=6;ix++){let d=Math.hypot(ix,iy)/6;if(d<=1){inside.push(sample(x+ix*r*.58/6,y+iy*r*.58/6));}}// Sample paper beyond the printed bubble: a small calibrated radius can put
 // the old background ring inside a fully filled blue bubble.
 for(let a=0;a<32;a++){let z=a*Math.PI/16;outside.push(sample(x+Math.cos(z)*r*2.4,y+Math.sin(z)*r*2.4));}outside.sort((a,b)=>a-b);let white=outside[Math.floor(outside.length*.8)],cut=Math.max(40,white-48),dark=inside.filter(v=>v<cut).length/inside.length;let pt=project(H,x,y);if(pt[0]<0||pt[1]<0||pt[0]>=w||pt[1]>=h)clipped++;const baseline=q.baseline?.[bubbleIndex]||0;return Math.max(0,Math.min(1,(dark-baseline)/Math.max(.15,1-baseline)));});const marked=ratios.map((v,i)=>v>=threshold?i:-1).filter(i=>i>=0),s=[...ratios].sort((a,b)=>b-a);let state=marked.length===0?'blank':marked.length>1?'multiple':s[0]<threshold+.15||(s[1]>threshold-.035&&s[0]-s[1]<.3)?'faint':'single';return{detected:marked,ratios,state,resolved:null,credit:null};});if(clipped)throw Error('Some bubbles are outside the image. Include the entire answer area.');return{answers,H};
}
function effective(a){if(a.resolved!==null&&a.resolved!==undefined)return a.resolved;return a.state==='single'?a.detected[0]:null;}
function pending(a){return a.state!=='single'&&a.resolved==null&&a.credit==null;}
function score(result,key,points=1){let correct=0,unresolved=0;const blanks=result.answers.filter(a=>a.state==='blank'&&a.resolved==null&&a.credit==null);result.answers.forEach(a=>{if(a.credit!=null){correct+=Number(a.credit);return;}if(pending(a)){if(!(a.state==='blank'&&result.blankReviewed))unresolved++;return;}if(effective(a)===key[result.answers.indexOf(a)])correct++;});correct+=result.blankReviewed?Math.min(result.blankCredit||0,blanks.length):0;return{correct,score:Math.round(correct*points*100)/100,max:Math.round(key.length*points*100)/100,pending:unresolved};}
function svg(t,title='Answer sheet',marks=null){const esc=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}"><rect width="100%" height="100%" fill="white"/>`;
 t.markers.forEach(([x,y])=>s+=`<rect x="${x-12}" y="${y-12}" width="24" height="24" fill="black"/>`);
 s+=`<g fill="#111" font-family="Arial,sans-serif"><text x="74" y="108" font-size="17" font-weight="bold" letter-spacing="2">BUBBLEGRADE</text><text x="74" y="154" font-size="27" font-weight="bold">${esc(title.slice(0,45))}</text><text x="74" y="204" font-size="16">Name: __________________________________</text><text x="74" y="237" font-size="16">Serial / ID: __________________  Lab: __________</text><text x="74" y="271" font-size="13">Fill one bubble completely. Keep all four black squares visible.</text>`;
 t.questions.forEach((q,i)=>{s+=`<text x="${q.bubbles[0][0]-35}" y="${q.bubbles[0][1]+4}" font-size="13" text-anchor="end">${i+1}</text>`;q.bubbles.forEach(([x,y],j)=>{const fill=marks?.[i]?.includes(j);s+=`<circle cx="${x}" cy="${y}" r="${q.r}" stroke="#222" stroke-width="1.25" fill="${fill?'#111':'white'}"/>`;if(!fill)s+=`<text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="${q.r<10?9:11}" fill="#888">${String.fromCharCode(65+j)}</text>`;});});s+=`<text x="74" y="1048" font-size="12">${t.questions.length} questions · ${t.options} choices · Print at 100% / actual size</text></g></svg>`;return s;
}
const api={template,homography,project,markers,guidedMarkers,markerAspect,refindMarkers,rereadResult,analyze,effective,pending,score,svg};if(typeof module!=='undefined')module.exports=api;root.OMR=api;
})(typeof window!=='undefined'?window:globalThis);
