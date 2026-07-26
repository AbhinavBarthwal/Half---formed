import React, { useEffect, useRef } from 'react';

export default function CommonsMap({ pods, onPodHover, onPodSelect }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Map nodes with positions and physics
    const nodes = pods.map(pod => ({
      ...pod,
      targetX: isFinite(pod.x * canvas.width) ? pod.x * canvas.width : canvas.width / 2,
      targetY: isFinite(pod.y * canvas.height) ? pod.y * canvas.height : canvas.height / 2,
      currX: isFinite(pod.x * canvas.width) ? pod.x * canvas.width : canvas.width / 2,
      currY: isFinite(pod.y * canvas.height) ? pod.y * canvas.height : canvas.height / 2,
      radius: Math.max(5, 5 + ((pod.memberCount || 0) * 1.6)),
      phase: Math.random() * Math.PI * 2
    }));

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (nodes.length === 0) return;

      // Constellation lines connecting nearby nodes
      ctx.strokeStyle = 'rgba(139, 148, 144, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].currX - nodes[j].currX;
          const dy = nodes[i].currY - nodes[j].currY;
          if (dx * dx + dy * dy < 160000) {
            ctx.moveTo(nodes[i].currX, nodes[i].currY);
            ctx.lineTo(nodes[j].currX, nodes[j].currY);
          }
        }
      }
      ctx.stroke();

      // Render glowing nodes
      nodes.forEach((node) => {
        node.currX = node.targetX + Math.sin(time / 2200 + node.phase) * 12;
        node.currY = node.targetY + Math.cos(time / 2600 + node.phase) * 12;

        if (!isFinite(node.currX) || !isFinite(node.currY) || !isFinite(node.radius) || node.radius <= 0) return;

        // Radial glow ring
        try {
          const gradient = ctx.createRadialGradient(node.currX, node.currY, 0, node.currX, node.currY, node.radius * 3.5);
          gradient.addColorStop(0, `${node.color}55`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.currX, node.currY, node.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {
          // ignore invalid gradient parameters fallback
        }

        // Node core dot
        ctx.fillStyle = node.color || '#8B9490';
        ctx.beginPath();
        ctx.arc(node.currX, node.currY, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Topic label
        ctx.fillStyle = '#8B9490';
        ctx.font = '12px "IBM Plex Mono", monospace';
        ctx.fillText(node.topic?.name || node.topic || '', node.currX + node.radius + 8, node.currY + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      let found = null;
      nodes.forEach(node => {
        const dx = mouseX - node.currX;
        const dy = mouseY - node.currY;
        if (dx * dx + dy * dy < (node.radius * 3) * (node.radius * 3) + 450) {
          found = node;
        }
      });
      onPodHover(found);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pods]);

  return (
    <canvas 
      ref={canvasRef} 
      onClick={onPodSelect}
      id="commons-map-canvas" 
      className="w-full h-full cursor-crosshair"
    />
  );
}
