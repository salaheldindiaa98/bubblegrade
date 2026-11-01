'use strict';
let scannerResizeObserver=null;
function scannerKey(){return session.mode==='anonymous'?'anonymous':targetStudent()?.id||'complete';}
function syncScanner(){
 if(!scannerOpen){closeScannerSurface();return;}
 let root=$('#scanner');
 if(!root){
  root=document.createElement('section');root.id='scanner';root.className='full-scanner';root.setAttribute('aria-label','Full-screen paper scanner');
  root.innerHTML=`<div class="scanner-stage" id="scannerStage"><video id="scannerVideo" autoplay playsinline muted></video><img id="scannerReference" class="scanner-reference hidden" alt="Blank answer sheet for layout preview"><div id="scannerGuides" class="scanner-guides"><div class="scanner-guide-frame"></div>${[1,2,3,4].map((n,i)=>`<div class="scanner-target" data-corner="${i}"><span>${n}</span></div><div class="scanner-detected hidden" data-detected="${i}"></div>`).join('')}</div><div class="scanner-center-label" id="scannerCenterLabel"></div></div><header class="scanner-header" id="scannerHeader"><div class="scanner-topline"><span id="scannerModeLabel">LIVE SCAN</span><div><button class="scanner-small-button" data-action="scannerFullscreen">⛶ Full screen</button><button class="scanner-small-button" data-action="exitScanner" aria-label="Close scanner">✕ Close</button></div></div><div class="scanner-person" id="scannerPerson"></div><div class="scanner-context" id="scannerContext"></div><div class="scanner-replace-note" id="scannerReplaceNote"></div></header><div class="scanner-footer" id="scannerFooter"><div class="scanner-last" id="scannerLast" role="status"></div><p class="scanner-status" id="scannerStatus" aria-live="polite"></p><div class="scanner-lookup hidden" id="scannerLookup"><form id="scannerLookupForm"><label for="scannerStudentInput">Change student by serial or ID</label><div class="scanner-input-row"><input id="scannerStudentInput" autocomplete="off" inputmode="text" placeholder="Type serial or student ID"><button class="scanner-button" type="submit">Find</button><button class="scanner-button secondary" data-action="scannerLookupCancel" type="button">Cancel</button></div></form><div id="scannerMatches" class="scanner-matches"></div></div><div class="scanner-roster-nav"><button class="scanner-button secondary" data-action="scannerPrevious">← Previous student</button><button class="scanner-button" data-action="scannerNext">Next student →</button></div><div id="scannerStudentActions" class="scanner-student-actions"></div><div class="scanner-main-controls"><button class="scanner-button" data-action="scannerChangeStudent">Find student</button><button class="scanner-button secondary" id="scannerPauseButton" data-action="scannerPause">Pause</button><button class="scanner-button secondary" data-action="scannerGroup">Group / mode</button></div><div class="scanner-secondary-controls"><label><input id="scannerContinuous" type="checkbox"> Auto scan</label><label><input id="scannerAutoNext" type="checkbox"> Auto-next</label><button class="scanner-link" data-action="capture" id="scannerCaptureButton">Capture now</button></div><div class="scanner-view-controls"><label>Camera view <select id="scannerFit" title="Full frame shows the whole camera image; Fill screen crops its edges."><option value="contain">Full frame</option><option value="cover">Fill screen</option></select></label><button class="scanner-link" data-action="scannerZoomReset">Reset to 1×</button></div><p class="scanner-instruction">Check the student above. Align the four printed registration squares with the targets to scan. Remove each paper fully before the next.</p></div>`;
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');document.body.append(root);$('.shell').inert=true;document.body.classList.add('scanner-is-open');
  $('#scannerVideo').onloadedmetadata=layoutScanner;
  if(typeof ResizeObserver!=='undefined'){scannerResizeObserver=new ResizeObserver(layoutScanner);scannerResizeObserver.observe($('#scannerStage'));scannerResizeObserver.observe($('#scannerHeader'));scannerResizeObserver.observe($('#scannerFooter'));}
 }
 root.classList.toggle('scanner-preview',scannerPreview);root.classList.toggle('scanner-paused',scannerPaused||scannerLookupOpen||busy);root.classList.toggle('scanner-lookup-open',scannerLookupOpen);
 const e=exam(),st=targetStudent(),test=session.mode==='anonymous',group=Gradebook.students(e),present=group.filter(s=>!s.absent),graded=group.filter(s=>resultFor(s));
 $('#scannerModeLabel').textContent=scannerPreview?'PREVIEW · CAMERA OFF':busy?'READING…':test?'ANONYMOUS TEST · v8':'LIVE SCAN · v8';
 $('#scannerPerson').innerHTML=test?'<strong>Anonymous test</strong><div class="scanner-identifiers"><span>No student record</span><span>No score or photo saved</span></div>':st?`<strong>${esc(st.name)}</strong><div class="scanner-identifiers"><span>Serial <b>${esc(st.serial)}</b></span><span>ID <b>${esc(st.studentId||'—')}</b></span></div>`:'<strong>This group is complete</strong><div class="scanner-identifiers"><span>Choose another group or a student to rescan.</span></div>';
 $('#scannerContext').textContent=`${e.name} · ${groupLabel()} · ${st?'Student '+(group.findIndex(s=>s.id===st.id)+1)+'/'+group.length+' · ':''}${graded.length}/${present.length} scanned`;
 $('#scannerReplaceNote').textContent=st?resultFor(st)?'Already scanned · choose Next or Rescan to replace this score.':st.absent?'Marked absent · choose Next or Mark present.':'':'';
 if(!test&&!scannerCanCapture())scannerPaused=true;
 const before=Gradebook.adjacent(e,st?.id,-1),after=st?Gradebook.adjacent(e,st.id,1):null;
 $('[data-action="scannerPrevious"]').disabled=busy||test||!before;$('[data-action="scannerNext"]').disabled=busy||test||!after;
 $('#scannerStudentActions').innerHTML=test||!st?'':resultFor(st)?'<button class="scanner-link" data-action="scannerRescan">Rescan this student</button>':st.absent?'<button class="scanner-link" data-action="scannerPresent">Mark present & scan</button>':'<button class="scanner-link" data-action="scannerAbsentNext">Absent & next student</button>';
 for(const button of $$('#scannerStudentActions button'))button.disabled=busy||scannerPreview;
 $('#scannerAutoNext').checked=e.cameraAutoNext===true;$('#scannerAutoNext').disabled=busy||test;$('#scannerFit').value=e.cameraFit==='cover'?'cover':'contain';$('#scannerFit').disabled=busy;
 $('#scannerLast').textContent=scannerNotice;
 $('#scannerPauseButton').textContent=scannerPaused?'Resume':'Pause';
 $('#scannerContinuous').checked=e.continuous;
 root.classList.toggle('scanner-paused',scannerPaused||scannerLookupOpen||busy);
 for(const sel of ['[data-action="scannerChangeStudent"]','[data-action="scannerPause"]','[data-action="scannerGroup"]','#scannerCaptureButton','#scannerContinuous']){const el=$(sel,root);if(el)el.disabled=busy||(scannerPreview&&sel!=='[data-action="scannerChangeStudent"]');}
 if(test)$('[data-action="scannerChangeStudent"]',root).disabled=true;
 if(!test&&!scannerCanCapture()){ $('#scannerPauseButton').disabled=true;$('#scannerCaptureButton').disabled=true; }
 $('#scannerLookup').classList.toggle('hidden',!scannerLookupOpen);
 const video=$('#scannerVideo');video.style.objectFit=e.cameraFit==='cover'?'cover':'contain';video.classList.toggle('hidden',scannerPreview);$('#scannerReference').classList.toggle('hidden',!scannerPreview);
 if(stream&&!scannerPreview&&video.srcObject!==stream){video.srcObject=stream;video.play().catch(()=>{});}
 if(scannerPreview){const img=$('#scannerReference'),src=e.template.background||'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(OMR.svg(e.template.native?e.template:OMR.template(20),e.name));if(img.src!==src)img.src=src;}
 setScannerStatus(scannerPreview?'Preview only — the camera is off and no paper is being scanned.':busy?'Reading and saving this paper…':scannerLookupOpen?'Capture paused while you choose a student.':scannerPaused?(!st&&!test?'This group is complete. Choose another group or Previous student.':st&&resultFor(st)?'Saved score kept. Choose Next student, or Rescan to replace it.':st?.absent?'This student is absent. Choose Next student, or Mark present.':'Capture paused. Check the student, then tap Resume.'):statusMessage||'Check the student above. Place each square anywhere inside its large box and hold steady.');
 layoutScanner();
}
function scannerGeometry(canvas=null){
 const stage=$('#scannerStage');if(!stage)return null;const v=$('#scannerVideo'),t=exam().template;
 const imageWidth=canvas?.width||v?.videoWidth||t.w,imageHeight=canvas?.height||v?.videoHeight||t.h;
 return ScanGeometry.layout({width:stage.clientWidth,height:stage.clientHeight,imageWidth,imageHeight,markers:t.markers,top:8,bottom:8,padLeft:12,padRight:12,fit:exam().cameraFit==='cover'?'cover':'contain'});
}
function layoutScanner(){
 if(!scannerOpen||!$('#scanner'))return;const stage=$('#scannerStage'),wide=window.innerWidth>window.innerHeight&&window.innerHeight<=550;Object.assign(stage.style,wide?{top:'0px',bottom:'0px',left:$('#scannerHeader').offsetWidth+'px',right:$('#scannerFooter').offsetWidth+'px'}:{top:$('#scannerHeader').offsetHeight+'px',bottom:$('#scannerFooter').offsetHeight+'px',left:'0px',right:'0px'});const g=scannerGeometry();if(!g)return;
 const frame=$('.scanner-guide-frame');Object.assign(frame.style,{left:g.frame.x+'px',top:g.frame.y+'px',width:g.frame.width+'px',height:g.frame.height+'px'});
 g.zones.forEach((z,i)=>{const el=$(`[data-corner="${i}"]`);Object.assign(el.style,{left:z.x+'px',top:z.y+'px',width:z.width+'px',height:z.height+'px'});});
 const label=$('#scannerCenterLabel');Object.assign(label.style,{left:g.frame.x+'px',top:g.frame.y+g.frame.height/2+'px',width:g.frame.width+'px'});label.textContent=scannerLookupOpen||scannerPaused?'CAPTURE PAUSED':scannerPreview?'PLACE THE FOUR PRINTED SQUARES HERE':'SQUARES CAN BE ANYWHERE INSIDE THE BOXES';
 if(scannerPreview){const t=exam().template,minX=Math.min(...t.markers.map(p=>p[0])),minY=Math.min(...t.markers.map(p=>p[1])),maxX=Math.max(...t.markers.map(p=>p[0])),k=g.frame.width/(maxX-minX);Object.assign($('#scannerReference').style,{left:(g.frame.x-minX*k)+'px',top:(g.frame.y-minY*k)+'px',width:t.w*k+'px',height:t.h*k+'px'});}
}
function updateScannerTracking(c,points){
 const g=scannerGeometry(c);if(!g)return{all:true};const m=ScanGeometry.match(points,g),root=$('#scanner');
 root.classList.toggle('corners-matched',m.all&&!needsRemoval&&!scannerPaused&&!scannerLookupOpen);
 m.matched.forEach((hit,i)=>{$(`[data-corner="${i}"]`).classList.toggle('matched',hit);const dot=$(`[data-detected="${i}"]`),p=m.points[i];dot.classList.toggle('hidden',!p);if(p){dot.style.left=p[0]+'px';dot.style.top=p[1]+'px';}});
 if(points&&!m.all){const dx=m.points.reduce((n,p,i)=>n+p[0]-g.targets[i][0],0)/4,dy=m.points.reduce((n,p,i)=>n+p[1]-g.targets[i][1],0)/4,count=m.matched.filter(Boolean).length;
 const move=Math.abs(dy)>g.half*.45?(dy>0?'Move the paper up a little.':'Move the paper down a little.'):Math.abs(dx)>g.half*.45?(dx>0?'Move the paper left a little.':'Move the paper right a little.'):'Place each square inside its corner target.';
 m.hint=`Four squares detected · ${count}/4 aligned. ${move}`;}
 return m;
}
function setScannerStatus(s,error=false){const el=$('#scannerStatus');if(!el)return;el.textContent=scannerPreview?'Layout preview only — camera off.':scannerLookupOpen?'Capture paused while you choose a student.':scannerPaused?(!targetStudent()&&session.mode!=='anonymous'?'This group is complete. Choose another group or Previous student.':targetStudent()&&resultFor(targetStudent())?'Saved score kept. Choose Next student, or Rescan to replace it.':targetStudent()?.absent?'Absent. Choose Next student, or Mark present.':'Capture paused. Check the student, then tap Resume.'):s;el.classList.toggle('scanner-error',error);}
function requestScannerFullscreen(){
 if(document.fullscreenElement)return;
 const fn=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;
 if(fn)try{Promise.resolve(fn.call(document.documentElement)).then(()=>{scannerNative=!!(document.fullscreenElement||document.webkitFullscreenElement);layoutScanner();}).catch(()=>{layoutScanner();});}catch{layoutScanner();}
}
function closeScannerSurface(){
 scannerResizeObserver?.disconnect();scannerResizeObserver=null;$('#scanner')?.remove();if($('.shell'))$('.shell').inert=false;document.body.classList.remove('scanner-is-open');
 if(scannerNative){scannerNative=false;const fn=document.exitFullscreen||document.webkitExitFullscreen;if(fn)try{Promise.resolve(fn.call(document)).catch(()=>{});}catch{}}
}
function previewScanner(){if(stream)stopCamera();scannerOpen=true;scannerPreview=true;scannerPaused=false;scannerLookupOpen=false;scannerNotice='';syncScanner();requestScannerFullscreen();}
function scannerChangeStudent(){
 if(busy){toast('Wait for this paper to finish saving.');return;}scannerLookupOpen=true;stableFrames=0;lastPts=null;syncScanner();$('#scannerStudentInput').value='';$('#scannerMatches').innerHTML='<p>Type a serial or ID. Results are limited to the selected group.</p>';$('#scannerStudentInput').focus();
}
function scannerFindStudent(){
 const input=$('#scannerStudentInput');if(!input)return;const q=input.value.trim(),root=$('#scannerMatches');
 if(!q){root.innerHTML='<p>Type the student’s serial or ID.</p>';return;}
 const list=Gradebook.search(exam(),q,exam().scanGroup).slice(0,12);
 root.innerHTML=list.map(st=>`<button type="button" class="scanner-match" data-action="scannerPickStudent" data-id="${esc(st.id)}"><span><strong>${esc(st.name)}</strong><small>Serial ${esc(st.serial)} · ID ${esc(st.studentId||'—')}</small></span><span>${resultFor(st)?'Replace score':st.absent?'Mark present & scan':'Select'}</span></button>`).join('')||'<p>No matching student in this group. Use Group / mode to select another group.</p>';
 layoutScanner();
}
function scannerCanCapture(){const st=targetStudent();return session.mode==='anonymous'||!!st&&!st.absent&&(!resultFor(st)||session.rescanAllowed===st.id);}
function scannerSelect(st){
 if(busy||!st||!Gradebook.inGroup(st,exam().scanGroup))return;
 if(session.mode==='student')session.studentId=st.id;else{session.mode='queue';session.cameraStudentId=st.id;}
 session.confirmed=st.id;session.rescanAllowed=null;session.active=true;scannerLookupOpen=false;scannerPaused=!!resultFor(st)||!!st.absent;autoReadyAt=Date.now()+1000;stableFrames=0;lastPts=null;scannerNotice=`Selected serial ${st.serial} · ${st.name}`;persist();render();setStatus(needsRemoval?'Remove the previous paper before placing this student’s paper.':'Check this student and position the matching paper.');
}
function scannerPickStudent(id){scannerSelect(exam().students.find(s=>s.id===id));}
function scannerStep(step){if(busy||session.mode==='anonymous')return;const st=Gradebook.adjacent(exam(),targetStudent()?.id,step);if(st)scannerSelect(st);}
function scannerAbsentNext(){
 if(busy||scannerPreview||session.mode==='anonymous')return;const e=exam(),st=targetStudent();if(!st||resultFor(st))return;
 const was=st.absent;st.absent=true;if(!persist()){st.absent=was;return;}
 const next=Gradebook.waitingAfter(e,st.id);session.mode='queue';session.cameraStudentId=null;e.cursor=null;session.rescanAllowed=null;
 if(next)scannerSelect(next);else{scannerPaused=true;render();setStatus('No present, unscanned students remain in this group.');}
}
function scannerPresent(){if(busy||scannerPreview)return;const st=targetStudent();if(!st||!st.absent||resultFor(st))return;st.absent=false;if(!persist()){st.absent=true;return;}scannerSelect(st);}
function scannerRescan(){if(busy||scannerPreview)return;const st=targetStudent();if(!st||st.absent||!resultFor(st))return;session.rescanAllowed=st.id;scannerPaused=false;stableFrames=0;lastPts=null;autoReadyAt=Date.now()+1000;setStatus('Rescan enabled. Place the matching student’s paper.');syncScanner();}
function scannerAfterCapture(st){
 session.rescanAllowed=null;
 if(session.mode==='queue'&&exam().cameraAutoNext===true){scannerPaused=false;session.cameraStudentId=null;exam().cursor=Gradebook.waitingAfter(exam(),st.id)?.id||null;}
 else{if(session.mode==='queue')session.cameraStudentId=st.id;scannerPaused=true;}
}
async function resetCameraZoom(){
 try{const track=stream?.getVideoTracks?.()[0],zoom=track?.getCapabilities?.().zoom;
 if(zoom&&track.applyConstraints){const value=Math.max(zoom.min,Math.min(zoom.max,1));await track.applyConstraints({advanced:[{zoom:value}]});}}catch{}
}
function chooseQuiz(){
 openModal('Choose a quiz',`<p>Select an existing quiz or create a new one.</p><div class="quiz-picker-list">${state.exams.map(e=>`<button class="btn ${e.id===exam().id?'primary':''} full" data-action="switchQuiz" data-id="${esc(e.id)}">${esc(e.name)} · ${e.key.length} questions · ${e.results.length} scans</button>`).join('')}</div>`,`<button class="btn" data-action="newExam">+ New quiz</button><button class="btn primary" data-action="close">Close</button>`);
}
Object.assign(actions,{
 scannerZoomReset:()=>resetCameraZoom(),scannerPrevious:()=>scannerStep(-1),scannerNext:()=>scannerStep(1),scannerAbsentNext,scannerPresent,scannerRescan,
 previewScanner,scannerFullscreen:requestScannerFullscreen,exitScanner:()=>{stopCamera();render();},scannerChangeStudent,
 scannerPause:()=>{if(busy||scannerPreview)return;scannerPaused=!scannerPaused;stableFrames=0;lastPts=null;autoReadyAt=Date.now()+1000;syncScanner();},
 scannerLookupCancel:()=>{scannerLookupOpen=false;autoReadyAt=Date.now()+1000;stableFrames=0;lastPts=null;syncScanner();},scannerPickStudent:b=>scannerPickStudent(b.dataset.id),
 scannerGroup:()=>{if(busy)return;scannerPaused=true;syncScanner();scanSession('live');},
 scanFilteredLab:()=>{const f=exam().studentLabFilter||'all';exam().scanGroup=f.startsWith('lab:')?{type:'lab',value:decodeURIComponent(f.slice(4))}:{type:'all',value:''};session.mode='queue';session.studentId=null;persist();switchView('scan');scanSession('camera','queue');},
 chooseQuiz,switchQuiz:b=>{stopCamera();state.active=b.dataset.id;session={active:false,mode:'queue',studentId:null,confirmed:null,source:'camera'};query='';persist();closeModal();render();}
});
document.addEventListener('submit',ev=>{if(ev.target.id==='scannerLookupForm'){ev.preventDefault();scannerFindStudent();}});
document.addEventListener('input',ev=>{if(ev.target.id==='scannerStudentInput'){scannerFindStudent();}});
document.addEventListener('change',ev=>{
 if(ev.target.id==='studentLabFilter'){exam().studentLabFilter=ev.target.value;persist();render();}
 if(ev.target.id==='scannerFit'){exam().cameraFit=ev.target.value==='cover'?'cover':'contain';stableFrames=0;lastPts=null;autoReadyAt=Date.now()+800;persist();syncScanner();}
 if(ev.target.id==='scannerAutoNext'){exam().cameraAutoNext=ev.target.checked;if(ev.target.checked&&targetStudent()&&resultFor(targetStudent())){exam().cursor=Gradebook.waitingAfter(exam(),targetStudent().id)?.id||null;session.cameraStudentId=null;scannerPaused=false;session.rescanAllowed=null;}persist();syncScanner();}
 if(ev.target.id==='scannerContinuous'){exam().continuous=ev.target.checked;stableFrames=0;lastPts=null;persist();syncScanner();}
});
window.addEventListener('resize',layoutScanner);
document.addEventListener('fullscreenchange',()=>{if(scannerNative&&!document.fullscreenElement)scannerNative=false;layoutScanner();});
syncScanner();
