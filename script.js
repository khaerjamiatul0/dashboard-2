const $ = id => document.getElementById(id);
const storage = {
  get(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}},
  set(key, value){try{localStorage.setItem(key, JSON.stringify(value))}catch{}}
};
let audioContext = null;

function enableAudio() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    console.warn("Browser tidak mendukung Web Audio API");
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(error => {
      console.warn("Audio gagal diaktifkan:", error);
    });
  }
}
function showToast(message){
  const toast=$('toast'); toast.textContent=message; toast.classList.add('show');
  clearTimeout(showToast.timeout); showToast.timeout=setTimeout(()=>toast.classList.remove('show'),2000);
}

// Jam, tanggal & salam (mengikuti waktu perangkat)
const pad=n=>String(n).padStart(2,'0');
function greetingFor(h){
  if(h>=4&&h<11)return ['Good morning','🌤️'];
  if(h>=11&&h<18)return ['Good afternoon','☀️'];
  return ['Good night','🌙'];
}
let lastGreeting='';
function updateClock(){
  const d=new Date(); // otomatis mengikuti jam & zona waktu perangkat pengguna
  const h=d.getHours();
  $('c-h').textContent=pad(h);
  $('c-m').textContent=pad(d.getMinutes());
  $('c-s').textContent=pad(d.getSeconds());
  $('clock-date').textContent=d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('today-label').textContent=d.toLocaleDateString('id-ID',{month:'long',year:'numeric'}).toUpperCase();
  const [text,emoji]=greetingFor(h);
  if(text!==lastGreeting){lastGreeting=text;$('greeting').textContent=text;$('greet-emoji').textContent=emoji}
}
updateClock();
(function tick(){updateClock();setTimeout(tick,1000-(Date.now()%1000)+5)})();

// To-do list
let tasks=storage.get('focusspace_tasks',[]);
function renderTasks(){
  const list=$('task-list'); list.innerHTML='';
  if(!tasks.length) list.innerHTML='<div class="empty">No tasks yet. Add your first task!</div>';
  tasks.forEach((task,index)=>{
    const row=document.createElement('div'); row.className='task-item'+(task.done?' done':'');
    const check=document.createElement('input'); check.type='checkbox'; check.checked=task.done; check.setAttribute('aria-label','Mark task complete');
    check.addEventListener('change',()=>{tasks[index].done=check.checked;saveTasks()});
    const label=document.createElement('span'); label.className='task-text'; label.textContent=task.text;
    const del=document.createElement('button'); del.className='delete'; del.textContent='×'; del.setAttribute('aria-label','Delete task');
    del.addEventListener('click',()=>{tasks.splice(index,1);saveTasks();showToast('Task deleted')});
    row.append(check,label,del); list.append(row);
  });
  $('total-count').textContent=tasks.length;
  const done=tasks.filter(t=>t.done).length;
  $('done-count').textContent=done;
  $('rate-count').textContent=tasks.length?Math.round(done/tasks.length*100)+'%':'0%';
  $('task-pill').textContent=tasks.length+' TASK'+(tasks.length===1?'':'S');
}
function saveTasks(){storage.set('focusspace_tasks',tasks);renderTasks()}
$('task-form').addEventListener('submit',e=>{
  e.preventDefault(); const value=$('task-input').value.trim(); if(!value)return;
  tasks.push({text:value,done:false}); saveTasks(); $('task-input').value=''; showToast('Task added');
});
renderTasks();

// Quick links
let links=storage.get('focusspace_links',[]);
function normalizeUrl(value){
  let url=value.trim();
  if(!/^https?:\/\//i.test(url)) url='https://'+url;
  try{const parsed=new URL(url); if(!['http:','https:'].includes(parsed.protocol))return null; return parsed.href}catch{return null}
}
function renderLinks(){
  const list=$('link-list'); list.innerHTML='';
  if(!links.length)list.innerHTML='<div class="empty">Add a website you use often.</div>';
  links.forEach((link,index)=>{
    const row=document.createElement('div');row.className='link-item';
    const symbol=document.createElement('div');symbol.className='link-symbol';symbol.textContent='↗';
    const name=document.createElement('span');name.className='link-name';name.textContent=link.name;
    const open=document.createElement('a');open.className='link-open';open.textContent='Open';open.href=link.url;open.target='_blank';open.rel='noopener noreferrer';
    const del=document.createElement('button');del.className='delete';del.textContent='×';del.setAttribute('aria-label','Delete link');
    del.addEventListener('click',()=>{links.splice(index,1);saveLinks();showToast('Link deleted')});
    row.append(symbol,name,open,del);list.append(row);
  });
}
function saveLinks(){storage.set('focusspace_links',links);renderLinks()}
$('link-form').addEventListener('submit',e=>{
  e.preventDefault();const name=$('link-name').value.trim();const url=normalizeUrl($('link-url').value);
  if(!name||!url){showToast('Please enter a valid website URL');return}
  links.push({name,url});saveLinks();$('link-name').value='';$('link-url').value='';showToast('Quick link added');
});
renderLinks();

// Pomodoro timer: durasi dapat diatur oleh pengguna
let focusMinutes=25, breakMinutes=5;
let seconds=focusMinutes*60, interval=null, running=false, mode='focus', endAt=0;

function durationForMode(){return (mode==='focus'?focusMinutes:breakMinutes)*60}

function drawTimer(){
  const mins=String(Math.floor(seconds/60)).padStart(2,'0');
  const secs=String(seconds%60).padStart(2,'0');
  $('timer').textContent=mins+':'+secs;
  document.title=running?mins+':'+secs+' · My Dashboard':'My Dashboard';
  const total=durationForMode();
  const elapsed=1-seconds/total;
  $('timer-ring').style.setProperty('--progress',(elapsed*360)+'deg');
}

function stopTimer(){
  clearInterval(interval);interval=null;running=false;document.title='My Dashboard';
  $('start-btn').textContent='▶ Start';
  $('timer-status').textContent='PAUSED';
}

// Alarm: 5 siklus "bip-bip-bip" (± 9 detik), keras, memakai Web Audio API.
function playAlarm() {
  try {
    if (!audioContext) return;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const context = audioContext;
    const master = context.createGain();
    master.gain.value = 1;

    const comp = context.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(context.destination);

    const t0 = context.currentTime + 0.05;
    let end = 0;

    for (let cycle = 0; cycle < 5; cycle++) {
      for (let beep = 0; beep < 3; beep++) {
        const start = t0 + cycle * 1.8 + beep * 0.45;
        const stop = start + 0.32;

        [["square", 880, 0.45], ["sine", 1320, 0.5]]
          .forEach(([type, freq, vol]) => {
            const osc = context.createOscillator();
            const gain = context.createGain();

            osc.type = type;
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
            gain.gain.setValueAtTime(vol, stop - 0.06);
            gain.gain.exponentialRampToValueAtTime(0.0001, stop);

            osc.connect(gain);
            gain.connect(master);

            osc.start(start);
            osc.stop(stop + 0.02);
          });

        end = stop;
      }
    }
  } catch (error) {
    console.warn("Audio tidak dapat diputar:", error);
  }
}

function startTimer(){
  if(running)return;

  enableAudio();
  running=true;
  endAt=Date.now()+seconds*1000;

  $('start-btn').textContent='Ⅱ Pause';
  $('timer-status').textContent=mode==='focus'?'FOCUS TIME':'BREAK TIME';

  interval=setInterval(()=>{
    seconds=Math.max(0,Math.round((endAt-Date.now())/1000));
    drawTimer();

    if(seconds<=0){
      clearInterval(interval);
      interval=null;

      playAlarm();

      if(mode==='focus'){
        mode='break';
        seconds=breakMinutes*60;
        showToast('Focus selesai! Saatnya istirahat.');
      }else{
        mode='focus';
        seconds=focusMinutes*60;
        showToast('Waktu istirahat selesai! Siap fokus lagi?');
      }

      $('timer-status').textContent=mode==='focus'?'FOCUS TIME':'BREAK TIME';
      drawTimer();

      // Otomatis memulai sesi berikutnya
      running=false;
      startTimer();
    }
  },250);
}

$('apply-timer').addEventListener('click',()=>{
  if(running){showToast('Pause timer sebelum mengubah durasi.');return}
  const focusValue=Number($('focus-minutes').value);
  const breakValue=Number($('break-minutes').value);
  if(!Number.isInteger(focusValue)||focusValue<1||focusValue>180||
     !Number.isInteger(breakValue)||breakValue<1||breakValue>60){
    showToast('Focus 1–180 menit, break 1–60 menit.');return;
  }
  focusMinutes=focusValue;breakMinutes=breakValue;
  mode='focus';seconds=focusMinutes*60;
  $('timer-status').textContent='READY TO FOCUS';
  drawTimer();showToast('Durasi timer berhasil diatur!');
});

$('start-btn').addEventListener('click',()=>{if(running)stopTimer();else startTimer()});
$('reset-btn').addEventListener('click',()=>{
  stopTimer();seconds=durationForMode();
  $('timer-status').textContent=mode==='focus'?'READY TO FOCUS':'READY FOR BREAK';
  drawTimer();showToast('Timer di-reset');
});
drawTimer();

// Navigasi sidebar
document.documentElement.style.scrollBehavior='smooth';
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{
  document.querySelectorAll('.nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');
}));