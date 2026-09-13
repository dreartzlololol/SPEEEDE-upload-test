import { useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
}

interface Cube3D {
  x: number;
  y: number;
  z: number;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
}

interface ScifiShape3D extends Cube3D {
  geoIndex: number;
}

interface Gear3D extends Cube3D {
  teeth: number;
}

interface CartoonShape3D extends Cube3D {
  shape: 'star' | 'circle' | 'triangle' | 'plus';
}

interface LightningStrike {
  points: { x: number; y: number }[];
  life: number;
}

export function BackgroundEffects() {
  const { theme } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.05;
      targetMouseY = (e.clientY - height / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const particles: Particle3D[] = Array.from({ length: 50 }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 1.5,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    // 3D Wireframe Sci-Fi Shapes
    const scifiShapes: ScifiShape3D[] = Array.from({ length: 35 }, () => ({
      x: (Math.random() - 0.5) * width * 3.0,
      y: (Math.random() - 0.5) * height * 3.0,
      z: Math.random() * 1500 - 500,
      size: Math.random() * 55 + 30,
      geoIndex: Math.floor(Math.random() * 3), // 0: Cube, 1: Pyramid, 2: Diamond
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.015,
      vRotY: (Math.random() - 0.5) * 0.015,
      vRotZ: (Math.random() - 0.5) * 0.015,
    }));

    // 3D Wireframe Gears
    const gears: Gear3D[] = Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.5) * width * 3.0,
      y: (Math.random() - 0.5) * height * 3.0,
      z: Math.random() * 1500 - 500,
      size: Math.random() * 150 + 100,
      teeth: Math.floor(Math.random() * 5) * 2 + 8,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.005,
      vRotY: (Math.random() - 0.5) * 0.005,
      vRotZ: (Math.random() - 0.5) * 0.015,
    }));

    // 3D Cartoon Shapes
    const cartoonShapes: CartoonShape3D[] = Array.from({ length: 30 }, () => {
      const types = ['star', 'circle', 'triangle', 'plus'] as const;
      return {
        x: (Math.random() - 0.5) * width * 3.0,
        y: (Math.random() - 0.5) * height * 3.0,
        z: Math.random() * 1500 - 500,
        size: Math.random() * 60 + 40,
        shape: types[Math.floor(Math.random() * types.length)],
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.015,
        vRotY: (Math.random() - 0.5) * 0.015,
        vRotZ: (Math.random() - 0.5) * 0.03,
      };
    });

    // Sci-Fi Geometries
    const scifiGeometries = [
      // Cube
      {
        vertices: [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ]
      },
      // Pyramid (Tetrahedron)
      {
        vertices: [
          [0, -1, 0], // Top
          [-1, 1, -1], [1, 1, -1], [0, 1, 1] // Base
        ],
        edges: [
          [0, 1], [0, 2], [0, 3],
          [1, 2], [2, 3], [3, 1]
        ]
      },
      // Diamond (Octahedron)
      {
        vertices: [
          [0, -1, 0], // Top
          [-1, 0, 0], [0, 0, -1], [1, 0, 0], [0, 0, 1], // Middle
          [0, 1, 0] // Bottom
        ],
        edges: [
          [0, 1], [0, 2], [0, 3], [0, 4],
          [1, 2], [2, 3], [3, 4], [4, 1],
          [5, 1], [5, 2], [5, 3], [5, 4]
        ]
      }
    ];

    const fov = 400;
    let activeLightning: LightningStrike[] = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isSystemDark = document.documentElement.classList.contains('dark');
      const activeTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Color Palette according to active theme
      let primaryColor = '#FF3366';
      let secondaryColor = '#00F3FF';
      if (activeTheme === 'cartoon') {
        primaryColor = '#FFD166';
        secondaryColor = '#DC2626';
      } else if (activeTheme === 'scifi') {
        primaryColor = '#00F3FF';
        secondaryColor = '#FF007F';
      } else if (activeTheme === 'steampunk') {
        primaryColor = '#D4AF37';
        secondaryColor = '#C86D3B';
      }

      // Render 3D Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z > 500) p.z = -400;
        if (p.z < -400) p.z = 500;
        if (Math.abs(p.x) > width) p.x = (Math.random() - 0.5) * width;
        if (Math.abs(p.y) > height) p.y = (Math.random() - 0.5) * height;

        const posX = p.x + mouseX * (p.z / 300);
        const posY = p.y + mouseY * (p.z / 300);
        const scale = fov / (fov + p.z + 500);

        if (scale > 0) {
          const projX = width / 2 + posX * scale;
          const projY = height / 2 + posY * scale;
          const projR = Math.max(0.5, p.size * scale);

          ctx.save();
          ctx.beginPath();
          ctx.arc(projX, projY, projR, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = Math.min(0.8, Math.max(0.1, p.opacity * scale));
          ctx.fill();
          ctx.restore();
        }
      });

      if (activeTheme === 'dark' || activeTheme === 'light') {
        // Draw 3D Grid for Dark and Light Themes
        ctx.save();
        const horizonY = height * 0.8;
        const floorY = 180 + mouseY * 0.05; 
        const gridFov = 400;
        const speed = 100;
        const timeOffset = (Date.now() * 0.001 * speed) % 100;
        
        ctx.beginPath();
        for (let z = 0; z < 2000; z += 100) {
          let actualZ = z - timeOffset;
          if (actualZ < 10) actualZ = 10;
          const scale = gridFov / (gridFov + actualZ);
          const y = horizonY + floorY * scale;
          if (y <= height) { // Optimization
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }
        }
        
        for (let x = -3000; x <= 3000; x += 100) {
          const startScale = gridFov / (gridFov + 10);
          const endScale = gridFov / (gridFov + 2000);
          const startX = width / 2 + (x - mouseX * 2) * startScale;
          const endX = width / 2 + (x - mouseX * 2) * endScale;
          const startY = horizonY + floorY * startScale;
          const endY = horizonY + floorY * endScale;
          
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
        }
        
        ctx.strokeStyle = activeTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        const grad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 150);
        if (activeTheme === 'dark') {
          grad.addColorStop(0, '#0A0A0A');
          grad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        } else {
          grad.addColorStop(0, '#FAFAFA');
          grad.addColorStop(1, 'rgba(250, 250, 250, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, horizonY - 20, width, 200);
        ctx.restore();

        // Red lighting flash like thunder
        if (Math.random() < 0.03) {
           const startX = Math.random() * width;
           const points = [{x: startX, y: 0}];
           let cx = startX;
           let cy = 0;
           
           let targetY = height;
           const horizonY = height * 0.8;
           targetY = horizonY + Math.random() * (height - horizonY) * 0.8; 
           
           while (cy < targetY) {
             cy += Math.random() * 30 + 10;
             if (cy > targetY) cy = targetY;
             cx += (Math.random() - 0.5) * 60;
             points.push({x: cx, y: cy});
           }
           activeLightning.push({ points, life: 1.0 });
        }

        for (let i = activeLightning.length - 1; i >= 0; i--) {
          const l = activeLightning[i];
          
          ctx.save();
          ctx.beginPath();
          for (let j = 0; j < l.points.length; j++) {
            if (j === 0) ctx.moveTo(l.points[j].x, l.points[j].y);
            else ctx.lineTo(l.points[j].x, l.points[j].y);
          }
          
          ctx.strokeStyle = `rgba(255, 50, 50, ${l.life})`;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FF0000';
          ctx.stroke();

          ctx.strokeStyle = `rgba(255, 200, 200, ${l.life})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Draw strike impact
          const lastPoint = l.points[l.points.length - 1];
          ctx.beginPath();
          ctx.ellipse(lastPoint.x, lastPoint.y, 60 * l.life, 20 * l.life, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 50, 50, ${l.life * 0.6})`;
          ctx.fill();

          ctx.restore();

          l.life -= 0.05 + Math.random() * 0.1;
          if (l.life <= 0) {
            activeLightning.splice(i, 1);
          }
        }
      } else if (activeTheme === 'cartoon') {
        // Render 3D Cartoon Shapes
        cartoonShapes.forEach((shape) => {
          shape.rotX += shape.vRotX;
          shape.rotY += shape.vRotY;
          shape.rotZ += shape.vRotZ;

          const posX = shape.x + mouseX * (shape.z / 200);
          const posY = shape.y + mouseY * (shape.z / 200);
          const scale = fov / (fov + shape.z + 500);

          if (scale > 0) {
            ctx.save();
            ctx.beginPath();
            
            if (shape.shape === 'star') {
              const segments = 10;
              for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
                const radius = (i % 2 === 0) ? shape.size : shape.size * 0.4;
                let x = Math.cos(angle) * radius;
                let y = Math.sin(angle) * radius;
                let z = 0;
                let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
                let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
                let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
                let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
                let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
                const finalX = width / 2 + (posX + x3) * scale;
                const finalY = height / 2 + (posY + y3) * scale;
                if (i === 0) ctx.moveTo(finalX, finalY);
                else ctx.lineTo(finalX, finalY);
              }
            } else if (shape.shape === 'circle') {
              const segments = 16;
              for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                let x = Math.cos(angle) * shape.size;
                let y = Math.sin(angle) * shape.size;
                let z = 0;
                let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
                let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
                let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
                let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
                let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
                const finalX = width / 2 + (posX + x3) * scale;
                const finalY = height / 2 + (posY + y3) * scale;
                if (i === 0) ctx.moveTo(finalX, finalY);
                else ctx.lineTo(finalX, finalY);
              }
            } else if (shape.shape === 'triangle') {
              const segments = 3;
              for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
                let x = Math.cos(angle) * shape.size;
                let y = Math.sin(angle) * shape.size;
                let z = 0;
                let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
                let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
                let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
                let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
                let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
                const finalX = width / 2 + (posX + x3) * scale;
                const finalY = height / 2 + (posY + y3) * scale;
                if (i === 0) ctx.moveTo(finalX, finalY);
                else ctx.lineTo(finalX, finalY);
              }
            } else if (shape.shape === 'plus') {
              const pts = [
                [-0.2, -1], [0.2, -1], [0.2, -0.2],
                [1, -0.2], [1, 0.2], [0.2, 0.2],
                [0.2, 1], [-0.2, 1], [-0.2, 0.2],
                [-1, 0.2], [-1, -0.2], [-0.2, -0.2],
                [-0.2, -1]
              ];
              for (let i = 0; i < pts.length; i++) {
                let x = pts[i][0] * shape.size;
                let y = pts[i][1] * shape.size;
                let z = 0;
                let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
                let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
                let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
                let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
                let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
                const finalX = width / 2 + (posX + x3) * scale;
                const finalY = height / 2 + (posY + y3) * scale;
                if (i === 0) ctx.moveTo(finalX, finalY);
                else ctx.lineTo(finalX, finalY);
              }
            }
            ctx.closePath();
            
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = Math.min(0.2, 0.2 * scale);
            ctx.fill();
            
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = Math.max(2, 4 * scale);
            ctx.globalAlpha = Math.min(0.6, 0.5 * scale);
            ctx.stroke();
            
            ctx.restore();
          }
        });
      } else if (activeTheme === 'steampunk') {
        // Render 3D Wireframe Gears
        gears.forEach((gear) => {
          gear.rotX += gear.vRotX;
          gear.rotY += gear.vRotY;
          gear.rotZ += gear.vRotZ;

          const posX = gear.x + mouseX * (gear.z / 200);
          const posY = gear.y + mouseY * (gear.z / 200);
          const scale = fov / (fov + gear.z + 500);

          if (scale > 0) {
            ctx.save();
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = Math.max(0.5, 2 * scale);
            ctx.globalAlpha = Math.min(0.5, 0.4 * scale);

            // Draw outer gear teeth
            ctx.beginPath();
            const segments = gear.teeth * 4;
            for (let i = 0; i <= segments; i++) {
              const step = i % 4;
              let radius = gear.size;
              if (step === 0 || step === 3) radius = gear.size * 0.75;
              
              const angle = (i / segments) * Math.PI * 2;
              let x = Math.cos(angle) * radius;
              let y = Math.sin(angle) * radius;
              let z = 0;

              let y1 = y * Math.cos(gear.rotX) - z * Math.sin(gear.rotX);
              let z1 = y * Math.sin(gear.rotX) + z * Math.cos(gear.rotX);
              let x2 = x * Math.cos(gear.rotY) + z1 * Math.sin(gear.rotY);
              let x3 = x2 * Math.cos(gear.rotZ) - y1 * Math.sin(gear.rotZ);
              let y3 = x2 * Math.sin(gear.rotZ) + y1 * Math.cos(gear.rotZ);

              const finalX = width / 2 + (posX + x3) * scale;
              const finalY = height / 2 + (posY + y3) * scale;

              if (i === 0) ctx.moveTo(finalX, finalY);
              else ctx.lineTo(finalX, finalY);
            }
            ctx.closePath();
            ctx.stroke();

            // Draw inner gear hole
            ctx.beginPath();
            for (let i = 0; i <= 20; i++) {
              const angle = (i / 20) * Math.PI * 2;
              const radius = gear.size * 0.3;
              
              let x = Math.cos(angle) * radius;
              let y = Math.sin(angle) * radius;
              let z = 0;

              let y1 = y * Math.cos(gear.rotX) - z * Math.sin(gear.rotX);
              let z1 = y * Math.sin(gear.rotX) + z * Math.cos(gear.rotX);
              let x2 = x * Math.cos(gear.rotY) + z1 * Math.sin(gear.rotY);
              let x3 = x2 * Math.cos(gear.rotZ) - y1 * Math.sin(gear.rotZ);
              let y3 = x2 * Math.sin(gear.rotZ) + y1 * Math.cos(gear.rotZ);

              const finalX = width / 2 + (posX + x3) * scale;
              const finalY = height / 2 + (posY + y3) * scale;

              if (i === 0) ctx.moveTo(finalX, finalY);
              else ctx.lineTo(finalX, finalY);
            }
            ctx.closePath();
            ctx.stroke();
            
            ctx.restore();
          }
        });
      } else {
        // Render 2D Scrolling Grid
        ctx.save();
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        
        const gridSize = 60;
        const offsetX = (mouseX * 0.5) % gridSize;
        const offsetY = ((Date.now() * 0.03) + mouseY * 0.5) % gridSize;

        ctx.beginPath();
        for (let x = -gridSize; x < width + gridSize; x += gridSize) {
          ctx.moveTo(x + offsetX, 0);
          ctx.lineTo(x + offsetX, height);
        }
        for (let y = -gridSize; y < height + gridSize; y += gridSize) {
          ctx.moveTo(0, y + offsetY);
          ctx.lineTo(width, y + offsetY);
        }
        ctx.stroke();
        ctx.restore();

        // Render 3D Wireframe Sci-Fi Shapes
        scifiShapes.forEach((shape) => {
          shape.rotX += shape.vRotX;
          shape.rotY += shape.vRotY;
          shape.rotZ += shape.vRotZ;

          const posX = shape.x + mouseX * (shape.z / 200);
          const posY = shape.y + mouseY * (shape.z / 200);
          const scale = fov / (fov + shape.z + 500);

          if (scale > 0) {
            const geo = scifiGeometries[shape.geoIndex];
            
            // Transform vertices in 3D
            const projectedPts = geo.vertices.map(([vx, vy, vz]) => {
              let x = vx * (shape.size / 2);
              let y = vy * (shape.size / 2);
              let z = vz * (shape.size / 2);

              // Rotate X
              let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
              let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
              // Rotate Y
              let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
              // Rotate Z
              let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
              let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);

              const finalX = width / 2 + (posX + x3) * scale;
              const finalY = height / 2 + (posY + y3) * scale;
              return [finalX, finalY];
            });

            // Draw wireframe edges
            ctx.save();
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = Math.max(1.5, 3 * scale);
            ctx.globalAlpha = Math.min(0.9, 0.7 * scale);
            ctx.shadowBlur = 15;
            ctx.shadowColor = secondaryColor;

            geo.edges.forEach(([i, j]) => {
              ctx.beginPath();
              ctx.moveTo(projectedPts[i][0], projectedPts[i][1]);
              ctx.lineTo(projectedPts[j][0], projectedPts[j][1]);
              ctx.stroke();
            });
            ctx.restore();
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
    </div>
  );
}
