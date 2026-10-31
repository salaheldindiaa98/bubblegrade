/* Camera-to-overlay geometry. Also used by automatic capture gating and regression tests. */
(function(root){'use strict';
function layout({width,height,imageWidth,imageHeight,markers,top=140,bottom=190,padLeft=28,padRight=28}){
 const scale=Math.min(width/imageWidth,height/imageHeight),video={x:(width-imageWidth*scale)/2,y:(height-imageHeight*scale)/2,width:imageWidth*scale,height:imageHeight*scale,scale};
 const minX=Math.min(...markers.map(p=>p[0])),maxX=Math.max(...markers.map(p=>p[0])),minY=Math.min(...markers.map(p=>p[1])),maxY=Math.max(...markers.map(p=>p[1]));
 const ratio=(maxX-minX)/Math.max(1,maxY-minY),left=Math.max(video.x+24,padLeft),right=Math.min(video.x+video.width-24,width-padRight),upper=Math.max(video.y+24,top+16),lower=Math.min(video.y+video.height-24,height-bottom-16);
 const availableW=Math.max(20,right-left),availableH=Math.max(20,lower-upper);let frameW=Math.min(availableW*.88,availableH*ratio*.9),frameH=frameW/ratio;
 const frame={x:left+(availableW-frameW)/2,y:upper+(availableH-frameH)/2,width:frameW,height:frameH};
 const targets=markers.map(([x,y])=>[frame.x+(x-minX)/Math.max(1,maxX-minX)*frameW,frame.y+(y-minY)/Math.max(1,maxY-minY)*frameH]);
 const half=Math.min(28,Math.max(13,Math.min(frameW,frameH)*.12));return{video,frame,targets,half};
}
function match(points,g){if(!points||points.length!==4)return{all:false,matched:[false,false,false,false],points:[]};const displayed=points.map(([x,y])=>[g.video.x+x*g.video.scale,g.video.y+y*g.video.scale]);const matched=displayed.map((p,i)=>Math.abs(p[0]-g.targets[i][0])<=g.half&&Math.abs(p[1]-g.targets[i][1])<=g.half);return{all:matched.every(Boolean),matched,points:displayed};}
const api={layout,match};root.ScanGeometry=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
