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

    // 3D Wireframe Cubes
    const cubes: Cube3D[] = Array.from({ length: 6 }, () => ({
      x: (Math.random() - 0.5) * width * 1.2,
      y: (Math.random() - 0.5) * height * 1.2,
      z: Math.random() * 600 - 300,
      size: Math.random() * 45 + 30,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.015,
      vRotY: (Math.random() - 0.5) * 0.015,
      vRotZ: (Math.random() - 0.5) * 0.015,
    }));

    // Cube 3D vertices
    const baseVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const fov = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Color Palette according to active theme
      let primaryColor = '#FF3366';
      let secondaryColor = '#00F3FF';
      if (theme === 'cartoon') {
        primaryColor = '#FFD166';
        secondaryColor = '#DC2626';
      } else if (theme === 'scifi') {
        primaryColor = '#00F3FF';
        secondaryColor = '#FF007F';
      } else if (theme === 'steampunk') {
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

      // Render 3D Wireframe Cubes
      cubes.forEach((cube) => {
        cube.rotX += cube.vRotX;
        cube.rotY += cube.vRotY;
        cube.rotZ += cube.vRotZ;

        const posX = cube.x + mouseX * (cube.z / 200);
        const posY = cube.y + mouseY * (cube.z / 200);
        const scale = fov / (fov + cube.z + 500);

        if (scale > 0) {
          // Transform vertices in 3D
          const projectedPts = baseVertices.map(([vx, vy, vz]) => {
            let x = vx * (cube.size / 2);
            let y = vy * (cube.size / 2);
            let z = vz * (cube.size / 2);

            // Rotate X
            let y1 = y * Math.cos(cube.rotX) - z * Math.sin(cube.rotX);
            let z1 = y * Math.sin(cube.rotX) + z * Math.cos(cube.rotX);
            // Rotate Y
            let x2 = x * Math.cos(cube.rotY) + z1 * Math.sin(cube.rotY);
            // Rotate Z
            let x3 = x2 * Math.cos(cube.rotZ) - y1 * Math.sin(cube.rotZ);
            let y3 = x2 * Math.sin(cube.rotZ) + y1 * Math.cos(cube.rotZ);

            const finalX = width / 2 + (posX + x3) * scale;
            const finalY = height / 2 + (posY + y3) * scale;
            return [finalX, finalY];
          });

          // Draw wireframe edges
          ctx.save();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = Math.max(0.5, 1.5 * scale);
          ctx.globalAlpha = Math.min(0.45, 0.3 * scale);

          edges.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(projectedPts[i][0], projectedPts[i][1]);
            ctx.lineTo(projectedPts[j][0], projectedPts[j][1]);
            ctx.stroke();
          });
          ctx.restore();
        }
      });

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
