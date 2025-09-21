
const io = new IntersectionObserver(ents=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target);} }); },{threshold:.08});
document.addEventListener('DOMContentLoaded', ()=>{ document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); });

function renderTimeline(data){
  const root = document.getElementById('timeline'); if(!root) return;
  data.sort((a,b)=> new Date(b.date) - new Date(a.date));
  root.innerHTML = data.map((ev,i)=>{
    const side = i%2===0? 'left':'right';
    return `<div class="t-item ${side} reveal"><div class="t-dot"></div><div class="t-date">${new Date(ev.date).toLocaleDateString()}</div><div class="t-title">${ev.title}</div><div class="t-meta">${ev.type||''} ${ev.location? '· '+ev.location:''}</div>${ev.notes? `<div class="small mt-1">${ev.notes}</div>`:''}</div>`;
  }).join('');
  document.querySelectorAll('.t-item').forEach(el=>io.observe(el));
  window.__timelineData = data;
}

function loadInlineJSON(){ 
  const el = document.getElementById('events-json'); 
  if(!el) return null; 
  try{ 
    const j = JSON.parse(el.textContent||'[]'); 
    return Array.isArray(j)? j : null; 
  } catch{ return null; } 
}

function initTimeline(){
  const data = loadInlineJSON(); 
  if(data){ renderTimeline(data); }
  const input = document.getElementById('events-upload');
  if(input){ input.addEventListener('change', (e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{const j=JSON.parse(r.result); if(Array.isArray(j)) renderTimeline(j);}catch{ alert('Invalid JSON'); } }; r.readAsText(f); }); }
  const btn = document.getElementById('events-export');
  if(btn){ btn.addEventListener('click', ()=>{ const data=window.__timelineData||[]; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='events.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),800); }); }
}
document.addEventListener('DOMContentLoaded', initTimeline);
