/* Camera-to-overlay geometry. Also used by automatic capture gating and regression tests. */
(function(root){'use strict';
function layout({width,height,imageWidth,imageHeight,markers,top=140,bottom=190,padLeft=24,padRight=24,fit='cover'}){
 const scale=(fit==='contain'?Math.min:Math.max)(width/imageWidth,height/imageHeight),video={x:(width-imageWidth*scale)/2,y:(height-imageHeight*scale)/2,width:imageWidth*scale,height:imageHeight*scale,scale};
 const minX=Math.min(...markers.map(p=>p[0])),maxX=Math.max(...markers.map(p=>p[0])),minY=Math.min(...markers.map(p=>p[1])),maxY=Math.max(...markers.map(p=>p[1]));
 const ratio=(maxX-minX)/Math.max(1,maxY-minY),left=Math.max(video.x+24,padLeft),right=Math.min(video.x+video.width-24,width-padRight),upper=Math.max(video.y+24,top+16),lower=Math.min(video.y+video.height-24,height-bottom-16);
 const availableW=Math.max(20,right-left),availableH=Math.max(20,lower-upper);let frameW=Math.min(availableW*.94,availableH*ratio*.94),frameH=frameW/ratio;
 const frame={x:left+(availableW-frameW)/2,y:upper+(availableH-frameH)/2,width:frameW,height:frameH};
 const anchors=markers.map(([x,y])=>[frame.x+(x-minX)/Math.max(1,maxX-minX)*frameW,frame.y+(y-minY)/Math.max(1,maxY-minY)*frameH]);
 // Large acceptance windows: the printed mark can be anywhere in its box.
 const half=Math.min(64,Math.max(24,Math.min(frameW,frameH)*.22)),zoneLeft=Math.max(8,left-16),zoneRight=Math.min(width-8,right+16),zoneTop=Math.max(8,upper-16),zoneBottom=Math.min(height-8,lower+16);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zones=anchors.map(([x,y])=>{const w=Math.min(half*2,zoneRight-zoneLeft),h=Math.min(half*2,zoneBottom-zoneTop);return{x:clamp(x-w/2,zoneLeft,zoneRight-w),y:clamp(y-h/2,zoneTop,zoneBottom-h),width:w,height:h};});
 const targets=zones.map(z=>[z.x+z.width/2,z.y+z.height/2]);return{video,frame,targets,zones,half,searchRadius:half+16,fit};
}
// Pixel region shown by centered object-fit: cover. Crop before reducing resolution
// so marker size/spacing checks operate on the same area the instructor sees.
function cameraCrop(imageWidth,imageHeight,width,height,fit='cover'){
 if(fit==='contain')return{x:0,y:0,width:imageWidth,height:imageHeight};
 const scale=Math.max(width/imageWidth,height/imageHeight),w=width/scale,h=height/scale;
 return{x:(imageWidth-w)/2,y:(imageHeight-h)/2,width:w,height:h};
}
function match(points,g){if(!points||points.length!==4)return{all:false,matched:[false,false,false,false],points:[]};const displayed=points.map(([x,y])=>[g.video.x+x*g.video.scale,g.video.y+y*g.video.scale]);const matched=displayed.map((p,i)=>{const z=g.zones?.[i];return z?p[0]>=z.x&&p[0]<=z.x+z.width&&p[1]>=z.y&&p[1]<=z.y+z.height:Math.abs(p[0]-g.targets[i][0])<=g.half&&Math.abs(p[1]-g.targets[i][1])<=g.half;});return{all:matched.every(Boolean),matched,points:displayed};}
// Compare movement with the printed mark span, independent of camera aspect/crop.
function steady(points,previous){
 if(!points||!previous||points.length!==4||previous.length!==4)return false;
 const span=Math.hypot(Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1])));
 const drift=points.map((p,i)=>Math.hypot(p[0]-previous[i][0],p[1]-previous[i][1]));
 const edge=(p,i)=>Math.hypot(p[i][0]-p[(i+1)%4][0],p[i][1]-p[(i+1)%4][1]);
 return Math.max(...drift)<=Math.max(4,span*.045)&&points.every((_,i)=>Math.abs(edge(points,i)/Math.max(1,edge(previous,i))-1)<.12);
}
const api={layout,match,cameraCrop,steady};root.ScanGeometry=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
