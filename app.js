'use strict';
const $ = id => document.getElementById(id);
const editVideo=$('edit-video'),stage=$('edit-stage'),scrub=$('edit-scrub');
let pendingSeek=null,mediaRequested=false;
const layoutNames={frame:'01 / FULL FRAME',split:'02 / SPLIT SCREEN',collage:'03 / COLLAGE'};
document.querySelectorAll('.layout-choice').forEach(button=>button.addEventListener('click',()=>{
  const layout=button.dataset.layout;
  stage.dataset.layout=layout;
  document.querySelectorAll('.layout-choice').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  $('layout-label').textContent=layoutNames[layout];
}));
$('edit-headline').addEventListener('input',event=>{
  const words=(event.target.value.trim()||'MAKE IT MOVE').toUpperCase().split(/\s+/);
  const spans=words.map(word=>{const span=document.createElement('span');span.textContent=word;return span;});
  $('stage-type').replaceChildren(...spans);
  const scale=Math.min(1,4/Math.max(...words.map(word=>word.length)),3/words.length);
  stage.style.setProperty('--type-scale',String(scale));
});
function formatTime(seconds){
  const safe=Number.isFinite(seconds)?Math.max(0,seconds):0;
  return `${String(Math.floor(safe/60)).padStart(2,'0')}:${String(Math.floor(safe%60)).padStart(2,'0')}.${Math.floor((safe%1)*10)}`;
}
function duration(){return Number.isFinite(editVideo.duration)&&editVideo.duration>0?editVideo.duration:32.994;}
function updateTimeline(time=editVideo.currentTime){
  const total=duration(),position=Math.max(0,Math.min(total,time));
  scrub.max=String(total);scrub.value=String(position);
  scrub.setAttribute('aria-valuetext',`${position.toFixed(1)} seconds of ${total.toFixed(1)} seconds`);
  $('edit-time').textContent=formatTime(position);
  $('edit-duration').textContent=formatTime(total);
  $('film-timeline').style.setProperty('--progress',`${position/total*100}%`);
}
function requestMedia(){
  if(!mediaRequested){mediaRequested=true;editVideo.preload='metadata';editVideo.load();}
}
scrub.addEventListener('input',()=>{
  const time=Number(scrub.value);
  editVideo.pause();
  if(editVideo.readyState>=1){editVideo.currentTime=Math.min(time,duration());}
  else {pendingSeek=time;$('edit-status').textContent='Loading your frame…';requestMedia();}
  updateTimeline(time);
});
editVideo.addEventListener('loadedmetadata',()=>{
  if(pendingSeek!==null){editVideo.currentTime=Math.min(pendingSeek,duration());pendingSeek=null;}
  updateTimeline();
});
editVideo.addEventListener('timeupdate',()=>updateTimeline());
editVideo.addEventListener('seeked',()=>{$('edit-status').textContent='';updateTimeline();});
function playbackState(){
  const playing=!editVideo.paused&&!editVideo.ended;
  $('edit-play').setAttribute('aria-pressed',String(playing));
  $('edit-play').setAttribute('aria-label',playing?'Pause preview':'Play preview');
  $('edit-play').querySelector('.play-icon').hidden=playing;
  $('edit-play').querySelector('.pause-icon').hidden=!playing;
}
['play','pause','ended'].forEach(event=>editVideo.addEventListener(event,playbackState));
editVideo.addEventListener('playing',()=>{$('edit-status').textContent='';});
editVideo.addEventListener('error',()=>{$('edit-status').textContent='The preview could not load. Try the reel in Our Work.';playbackState();});
$('edit-play').addEventListener('click',async()=>{
  if(!editVideo.paused){editVideo.pause();return;}
  requestMedia();
  if(editVideo.ended)editVideo.currentTime=0;
  $('edit-status').textContent='Loading preview…';
  try{await editVideo.play();}
  catch(error){if(error.name==='AbortError'){$('edit-status').textContent='';}else{$('edit-status').textContent='Tap play to try loading the preview again.';}playbackState();}
});
$('edit-sound').addEventListener('click',()=>{editVideo.muted=!editVideo.muted;});
editVideo.addEventListener('volumechange',()=>{
  $('edit-sound').textContent=editVideo.muted?'Sound off':'Sound on';
  $('edit-sound').setAttribute('aria-pressed',String(!editVideo.muted));
});
updateTimeline(0);
const menu=document.querySelector('.menu-toggle'),nav=$('navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();})));
const pepTalks=['Your next good idea might be the weird one.','One good story. Start there.','A little personality goes a long way.','You don’t need a louder voice. You need your own.'];let pepIndex=0;
$('coach').addEventListener('click',()=>{$('coach-message').textContent=pepTalks[pepIndex++%pepTalks.length];$('coach').classList.remove('pump');void $('coach').offsetWidth;$('coach').classList.add('pump');});
$('year').textContent=String(new Date().getFullYear());
