const video = document.querySelector('#camera');
const canvas = document.querySelector('#analysisCanvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const elements = {
  start: document.querySelector('#startBtn'), stop: document.querySelector('#stopBtn'), placeholder: document.querySelector('#cameraPlaceholder'), cameraMessage: document.querySelector('#cameraMessage'),
  status: document.querySelector('#statusPill'), banner: document.querySelector('#motionBanner'), level: document.querySelector('#motionLevel'), meter: document.querySelector('#meterFill'),
  count: document.querySelector('#eventCount'), last: document.querySelector('#lastActivity'), lastDetail: document.querySelector('#lastActivityDetail'), log: document.querySelector('#eventLog'), sensitivity: document.querySelector('#sensitivity'), sensitivityValue: document.querySelector('#sensitivityValue'), clear: document.querySelector('#clearBtn')
};
let stream, frameId, previous, lastEvent = 0, events = 0;
const sampleWidth = 160, sampleHeight = 90;

function setStatus(type, text) { elements.status.className = `status-pill ${type}`; elements.status.querySelector('b').textContent = text; }
function sensitivityLabel(value) { return value < 11 ? 'High' : value > 21 ? 'Low' : 'Medium'; }
function logEvent(level) {
  const time = new Date(); events++; elements.count.textContent = events; elements.last.textContent = time.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); elements.lastDetail.textContent = `${level}% motion level`;
  if (elements.log.querySelector('.empty')) elements.log.innerHTML = '';
  const item = document.createElement('li'); item.innerHTML = `<b>Motion detected</b><span>${time.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>`; elements.log.prepend(item);
}
function monitor() {
  if (!stream) return;
  context.drawImage(video, 0, 0, sampleWidth, sampleHeight);
  const current = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  let changed = 0;
  if (previous) for (let i = 0; i < current.length; i += 16) { const delta = Math.abs(current[i]-previous[i]) + Math.abs(current[i+1]-previous[i+1]) + Math.abs(current[i+2]-previous[i+2]); if (delta > 55) changed++; }
  previous = current; const level = Math.min(100, Math.round(changed / (sampleWidth * sampleHeight / 4) * 100));
  elements.level.textContent = `${level}%`; elements.meter.style.width = `${level}%`;
  const detected = level > Number(elements.sensitivity.value);
  const now = Date.now();
  if (detected) { setStatus('alert','Motion detected'); elements.banner.classList.add('visible'); if (now-lastEvent > 4000) { lastEvent = now; logEvent(level); } }
  else { setStatus('online','Monitoring'); elements.banner.classList.remove('visible'); }
  frameId = requestAnimationFrame(monitor);
}
async function start() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support camera access. Open this site in Chrome or Edge.');
    // Prefer the outward-facing camera on phones, then fall back to any webcam.
    try { stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' }, audio:false }); }
    catch { stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false }); }
    video.srcObject = stream; await video.play(); canvas.width=sampleWidth; canvas.height=sampleHeight; previous=null; elements.cameraMessage.textContent='Press Start monitoring to connect your camera.'; elements.placeholder.hidden=true; elements.placeholder.style.display='none'; elements.start.disabled=true; elements.stop.disabled=false; setStatus('online','Monitoring'); monitor();
  }
  catch (error) {
    const isDenied = error.name === 'NotAllowedError' || error.name === 'SecurityError';
    const message = isDenied ? 'Camera permission was blocked. Allow it in your browser settings, then try again.' : `Camera unavailable: ${error.message}`;
    elements.cameraMessage.textContent = message; setStatus('offline','Camera unavailable');
  }
}
function stop() { cancelAnimationFrame(frameId); stream?.getTracks().forEach(track=>track.stop()); stream=null; video.srcObject=null; previous=null; elements.placeholder.hidden=false; elements.placeholder.style.display=''; elements.start.disabled=false; elements.stop.disabled=true; elements.level.textContent='0%'; elements.meter.style.width='0%'; elements.banner.classList.remove('visible'); setStatus('offline','Camera offline'); }
elements.start.addEventListener('click', start); elements.stop.addEventListener('click', stop); elements.sensitivity.addEventListener('input', e => elements.sensitivityValue.textContent=sensitivityLabel(e.target.value)); elements.clear.addEventListener('click', () => { events=0; elements.count.textContent='0'; elements.log.innerHTML='<li class="empty">No activity yet. Monitoring events will appear here.</li>'; }); window.addEventListener('beforeunload', stop);
