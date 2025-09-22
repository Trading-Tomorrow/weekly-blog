
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

// AI Network Visualization
function initAIVisualization() {
  const container = document.getElementById('ai-visualization-container');
  const svg = d3.select('#ai-network-viz');
  
  if (!container || !svg.node()) {
    console.log('Container or SVG not found');
    return;
  }
  
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  
  console.log('Initializing AI visualization', { width, height });
  
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  
  // Create nodes data - representing AI neural network
  const nodes = [];
  const links = [];
  
  // Generate scattered nodes across the screen
  const totalNodes = 35; // More nodes for better coverage
  let nodeId = 0;
  
  // Create clusters for more organic distribution
  const clusters = [
    { centerX: width * 0.2, centerY: height * 0.3, radius: Math.min(width, height) * 0.15, nodeCount: 8 },
    { centerX: width * 0.5, centerY: height * 0.2, radius: Math.min(width, height) * 0.12, nodeCount: 6 },
    { centerX: width * 0.8, centerY: height * 0.4, radius: Math.min(width, height) * 0.13, nodeCount: 7 },
    { centerX: width * 0.3, centerY: height * 0.7, radius: Math.min(width, height) * 0.11, nodeCount: 5 },
    { centerX: width * 0.7, centerY: height * 0.8, radius: Math.min(width, height) * 0.14, nodeCount: 9 }
  ];
  
  clusters.forEach((cluster, clusterIndex) => {
    for (let i = 0; i < cluster.nodeCount; i++) {
      // Random angle and distance within cluster
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * cluster.radius;
      
      const x = cluster.centerX + Math.cos(angle) * distance;
      const y = cluster.centerY + Math.sin(angle) * distance;
      
      // Ensure nodes stay within screen bounds
      const clampedX = Math.max(50, Math.min(width - 50, x));
      const clampedY = Math.max(50, Math.min(height - 50, y));
      
      const baseRadius = Math.random() * 8 + 8;
      nodes.push({
        id: nodeId++,
        cluster: clusterIndex,
        x: clampedX,
        y: clampedY,
        baseRadius: baseRadius,
        maxRadius: baseRadius * 2.5,
        currentRadius: baseRadius,
        value: Math.random(),
        active: Math.random() > 0.7,
        pulsePhase: Math.random() * Math.PI * 2,
        expansionPhase: Math.random() * Math.PI * 2,
        energy: Math.random(),
        targetRadius: baseRadius
      });
    }
  });
  
  console.log('Created nodes:', nodes.length);
  
  // Create connections between nearby nodes and across clusters
  nodes.forEach(node => {
    // Connect to nearby nodes within same cluster
    const nearbyNodes = nodes.filter(n => {
      if (n.id === node.id) return false;
      const distance = Math.sqrt(Math.pow(n.x - node.x, 2) + Math.pow(n.y - node.y, 2));
      return distance < Math.min(width, height) * 0.2; // Connect if within 20% of screen size
    });
    
    nearbyNodes.forEach(target => {
      if (Math.random() > 0.6) { // 40% chance of connection
        const distance = Math.sqrt(Math.pow(target.x - node.x, 2) + Math.pow(target.y - node.y, 2));
        const maxDistance = Math.min(width, height) * 0.2;
        const strength = 1 - (distance / maxDistance); // Closer nodes have stronger connections
        
        links.push({
          source: node.id,
          target: target.id,
          strength: strength
        });
      }
    });
    
    // Also create some long-distance connections between clusters
    if (Math.random() > 0.85) { // 15% chance for long connections
      const otherClusterNodes = nodes.filter(n => n.cluster !== node.cluster);
      if (otherClusterNodes.length > 0) {
        const randomTarget = otherClusterNodes[Math.floor(Math.random() * otherClusterNodes.length)];
        links.push({
          source: node.id,
          target: randomTarget.id,
          strength: Math.random() * 0.5 + 0.3 // Medium strength for long connections
        });
      }
    }
  });
  
  console.log('Created links:', links.length);

  // Create force simulation with bigger collision radius
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).strength(0.08))
    .force('charge', d3.forceManyBody().strength(-80))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.maxRadius + 5));
  
  // Create links with better visibility
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', 'rgba(0, 200, 255, 0.5)')
    .attr('stroke-width', d => d.strength * 3 + 1)
    .style('opacity', d => d.strength * 0.8 + 0.3);
  
  // Create expansion rings for breathing effect
  const expansionRings = svg.append('g')
    .selectAll('.expansion-ring')
    .data(nodes)
    .join('circle')
    .attr('class', 'expansion-ring')
    .attr('r', d => d.baseRadius * 1.2)
    .attr('fill', 'none')
    .attr('stroke', d => d.active ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 100, 255, 0.4)')
    .attr('stroke-width', 3)
    .style('opacity', 0);

  // Create nodes with bigger initial size and vibrant colors
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node')
    .attr('r', d => d.currentRadius)
    .attr('fill', d => {
      const intensity = d.value;
      return d.active 
        ? `rgba(0, 255, 255, ${0.9 + intensity * 0.1})` // Bright cyan for active
        : `rgba(255, 100, 255, ${0.7 + intensity * 0.2})`; // Bright magenta for inactive
    })
    .attr('stroke', d => d.active ? '#00ffff' : '#ff64ff')
    .attr('stroke-width', d => d.active ? 4 : 3)
    .style('filter', d => d.active ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 1))' : 'drop-shadow(0 0 15px rgba(255, 100, 255, 0.8))');
  
  console.log('Created visualization elements');
  
  // Enhanced interactivity with bigger effects
  node.on('mouseover', function(event, d) {
    // Dramatic expansion
    d3.select(this)
      .transition()
      .duration(300)
      .ease(d3.easeBackOut)
      .attr('r', d.maxRadius * 1.2)
      .style('filter', d.active ? 'drop-shadow(0 0 30px rgba(0, 255, 255, 1))' : 'drop-shadow(0 0 30px rgba(255, 100, 255, 1))');
    
    // Create ripple effect
    expansionRings.filter(ring => ring.id === d.id)
      .transition()
      .duration(600)
      .ease(d3.easeCircleOut)
      .attr('r', d.maxRadius * 2)
      .style('opacity', 0.8)
      .transition()
      .duration(400)
      .attr('r', d.maxRadius * 3)
      .style('opacity', 0);
    
    link.classed('active', l => l.source.id === d.id || l.target.id === d.id);
  })
  .on('mouseout', function(event, d) {
    d3.select(this)
      .transition()
      .duration(300)
      .ease(d3.easeBackOut)
      .attr('r', d.currentRadius)
      .style('filter', d.active ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 1))' : 'drop-shadow(0 0 15px rgba(255, 100, 255, 0.8))');
    
    link.classed('active', false);
  });
  
  // Update positions on simulation tick with enhanced animations
  simulation.on('tick', () => {
    const time = Date.now() * 0.001;
    
    // Update node animations
    nodes.forEach(d => {
      // Larger floating movement
      const floatX = Math.sin(time * 0.8 + d.pulsePhase) * 8;
      const floatY = Math.cos(time * 0.6 + d.pulsePhase) * 6;
      
      d.displayX = d.x + floatX;
      d.displayY = d.y + floatY;
      
      // Pulsing radius with breathing effect
      const pulseIntensity = d.active ? 0.4 : 0.2;
      const breathe = Math.sin(time * 1.5 + d.expansionPhase) * pulseIntensity;
      d.currentRadius = d.baseRadius + breathe * d.baseRadius;
      
      // Energy-based expansion
      if (d.energy > 0.8) {
        d.currentRadius += Math.sin(time * 3 + d.pulsePhase) * 3;
      }
    });
    
    link
      .attr('x1', d => d.source.displayX || d.source.x)
      .attr('y1', d => d.source.displayY || d.source.y)
      .attr('x2', d => d.target.displayX || d.target.x)
      .attr('y2', d => d.target.displayY || d.target.y);
    
    node
      .attr('cx', d => Math.max(d.currentRadius, Math.min(width - d.currentRadius, d.displayX)))
      .attr('cy', d => Math.max(d.currentRadius, Math.min(height - d.currentRadius, d.displayY)))
      .attr('r', d => d.currentRadius);
    
    expansionRings
      .attr('cx', d => Math.max(d.currentRadius, Math.min(width - d.currentRadius, d.displayX)))
      .attr('cy', d => Math.max(d.currentRadius, Math.min(height - d.currentRadius, d.displayY)));
  });
  
  // Enhanced node activation with expansion waves
  function activateRandomNode() {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    randomNode.active = !randomNode.active;
    randomNode.energy = Math.random(); // Refresh energy
    
    // Dramatic visual change
    node.filter(d => d.id === randomNode.id)
      .transition()
      .duration(800)
      .ease(d3.easeElasticOut)
      .attr('fill', randomNode.active 
        ? `rgba(0, 255, 255, ${0.9 + randomNode.value * 0.1})`
        : `rgba(255, 100, 255, ${0.7 + randomNode.value * 0.2})`)
      .attr('stroke', randomNode.active ? '#00ffff' : '#ff64ff')
      .attr('stroke-width', randomNode.active ? 4 : 3)
      .style('filter', randomNode.active ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 1))' : 'drop-shadow(0 0 15px rgba(255, 100, 255, 0.8))');
    
    // Create expansion wave on activation
    if (randomNode.active) {
      expansionRings.filter(d => d.id === randomNode.id)
        .attr('r', randomNode.baseRadius)
        .style('opacity', 0.8)
        .transition()
        .duration(1500)
        .ease(d3.easeCircleOut)
        .attr('r', randomNode.maxRadius * 3)
        .style('opacity', 0);
      
      // Create secondary wave
      setTimeout(() => {
        expansionRings.filter(d => d.id === randomNode.id)
          .attr('r', randomNode.baseRadius * 0.5)
          .style('opacity', 0.4)
          .transition()
          .duration(1000)
          .ease(d3.easeCircleOut)
          .attr('r', randomNode.maxRadius * 2)
          .style('opacity', 0);
      }, 300);
    }
  }
  
  // Start activation cycle with varied timing
  setInterval(activateRandomNode, 1200);
  
  // Add periodic energy bursts
  setInterval(() => {
    nodes.forEach(node => {
      if (Math.random() > 0.85) {
        node.energy = Math.min(1, node.energy + 0.4);
        
        // Visual energy burst
        expansionRings.filter(d => d.id === node.id)
          .attr('r', node.baseRadius * 0.8)
          .style('opacity', 0.3)
          .transition()
          .duration(800)
          .ease(d3.easeCircleOut)
          .attr('r', node.maxRadius * 1.8)
          .style('opacity', 0);
      }
    });
  }, 2000);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    svg.attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
    simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
    simulation.alpha(0.3).restart();
  });
}

// Initialize AI visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAIVisualization);
