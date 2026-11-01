/* Queue, student matching and result updates shared by the browser and regression tests. */
(function(root){
'use strict';
const text=v=>String(v??'').trim();
function inGroup(s,g){return !g||g.type==='all'||text(s[g.type])===text(g.value);}
function students(e,g=e.scanGroup){return [...e.students].filter(s=>inGroup(s,g)).sort((a,b)=>text(a.serial).localeCompare(text(b.serial),undefined,{numeric:true})||text(a.name).localeCompare(text(b.name)));}
function filterRoster(e,labFilter='all',query=''){const q=text(query).toLowerCase(),lab=labFilter.startsWith('lab:')?decodeURIComponent(labFilter.slice(4)):null;return students(e,{type:'all'}).filter(s=>(lab===null||text(s.lab)===lab)&&[s.name,s.serial,s.studentId,s.lab,s.lecture].map(text).join(' ').toLowerCase().includes(q));}
function next(e,g=e.scanGroup){const ss=students(e,g).filter(s=>!s.absent&&!e.results.some(r=>r.studentId===s.id));return ss.find(s=>s.id===e.cursor)||ss[0]||null;}
function adjacent(e,id,step){const ss=students(e),i=ss.findIndex(s=>s.id===id);return ss[i<0?(step<0?ss.length-1:0):i+(step<0?-1:1)]||null;}
function waitingAfter(e,id){const ss=students(e),i=ss.findIndex(s=>s.id===id),order=[...ss.slice(i+1),...ss.slice(0,i+1)];return order.find(s=>!s.absent&&!e.results.some(r=>r.studentId===s.id))||null;}
function search(e,q,g={type:'all'}){q=text(q).toLowerCase();const all=students(e,g);if(!q)return all;const exact=all.filter(s=>[s.serial,s.studentId].some(v=>text(v).toLowerCase()===q));return exact.length?exact:all.filter(s=>[s.serial,s.studentId,s.name].some(v=>text(v).toLowerCase().includes(q)));}
function putResult(e,r){if(!e.students.some(s=>s.id===r.studentId))throw Error('Student is not in this quiz.');const old=e.results.find(x=>x.studentId===r.studentId);e.results=e.results.filter(x=>x.studentId!==r.studentId);e.results.push(r);return old||null;}
function signature(e){const t=e.template;return JSON.stringify({key:e.key,points:e.points,w:t.w,h:t.h,options:t.options,markers:t.markers,questions:t.questions});}
function matchStudent(e,s){let exact=e.students.find(x=>x.id===s.id);if(exact)return exact;const ids=text(s.studentId)?e.students.filter(x=>text(x.studentId)===text(s.studentId)):[];if(ids.length===1)return ids[0];const serial=e.students.filter(x=>text(x.serial)===text(s.serial)&&text(x.name)===text(s.name));return serial.length===1?serial[0]:null;}
const api={inGroup,students,next,adjacent,waitingAfter,search,putResult,signature,matchStudent,filterRoster};root.Gradebook=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
