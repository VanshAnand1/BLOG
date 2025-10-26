"use client";
import { useEffect, useRef } from "react";
type StarSpawnStrategy = "center" | "edges" | "rain";
type StarSpeedProfile = "slow" | "medium" | "fast";
type StarColorMode = "auto" | "duotone" | "rainbow" | "custom";
interface StarFieldProps {
  starCount?: number;
  spawnStrategy?: StarSpawnStrategy;
  speed?: StarSpeedProfile;
  colorMode?: StarColorMode;
  customColors?: string[];
  cursorReactive?: boolean;
  twinkle?: boolean;
}
interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  twinklePhase: number;
}
const SPEED_MULTIPLIER: Record<StarSpeedProfile, number> = {
  slow: 0.25,
  medium: 0.55,
  fast: 1,
};
const DEFAULT_COLORS = {
  light: ["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)"],
  dark: ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.6)"],
};
export default function StarField({
  starCount = 220,
  spawnStrategy = "center",
  speed = "medium",
  colorMode = "auto",
  customColors,
  cursorReactive = true,
  twinkle = true,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    let animationId: number;
    const stars: Star[] = [];
    let stageWidth = 0;
    let stageHeight = 0;
    let dpr = window.devicePixelRatio || 1;
    const pointer = { x: 0, y: 0, active: false };
    const resolveColors = (): string[] => {
      if (colorMode === "custom" && customColors?.length) {
        return customColors;
      }
      const isDark = document.documentElement.classList.contains("dark");
      if (colorMode === "rainbow") {
        return [
          "#facc15",
          "#f97316",
          "#ef4444",
          "#ec4899",
          "#a855f7",
          "#22d3ee",
        ];
      }
      if (colorMode === "duotone") {
        return isDark ? ["#ffffff", "#4ade80"] : ["#111827", "#2563eb"];
      }
      return isDark ? DEFAULT_COLORS.dark : DEFAULT_COLORS.light;
    };
    const colors = resolveColors();
    const speedFactor = SPEED_MULTIPLIER[speed];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      stageWidth = rect.width;
      stageHeight = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(stageWidth * dpr);
      canvas.height = Math.round(stageHeight * dpr);
      if (typeof ctx.resetTransform === "function") {
        ctx.resetTransform();
      }
      ctx.scale(dpr, dpr);
      pointer.x = stageWidth * 0.5;
      pointer.y = stageHeight * 0.5;
    };
    const spawnStar = (initial = false): Star => {
      const size = Math.random() * 1.6 + 0.4;
      const color =
        colors.length === 1
          ? colors[0]
          : colors[Math.floor(Math.random() * colors.length)];
      const baseVelocity = (Math.random() * 0.6 + 0.4) * (25 * speedFactor);
      let x = Math.random() * stageWidth;
      let y = Math.random() * stageHeight;
      let angle = Math.random() * Math.PI * 2;
      switch (spawnStrategy) {
        case "center": {
          const radius = initial
            ? Math.random() * Math.min(stageWidth, stageHeight) * 0.45
            : Math.random() * Math.min(stageWidth, stageHeight) * 0.1;
          angle = Math.random() * Math.PI * 2;
          x = stageWidth / 2 + Math.cos(angle) * radius;
          y = stageHeight / 2 + Math.sin(angle) * radius;
          break;
        }
        case "edges": {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) {
            x = Math.random() * stageWidth;
            y = -20;
          } else if (edge === 1) {
            x = stageWidth + 20;
            y = Math.random() * stageHeight;
          } else if (edge === 2) {
            x = Math.random() * stageWidth;
            y = stageHeight + 20;
          } else {
            x = -20;
            y = Math.random() * stageHeight;
          }
          angle = Math.atan2(stageHeight / 2 - y, stageWidth / 2 - x);
          break;
        }
        case "rain": {
          x = Math.random() * stageWidth;
          y = initial ? Math.random() * stageHeight : -40;
          angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
          break;
        }
        default:
          break;
      }
      const vx = Math.cos(angle) * baseVelocity;
      const vy = Math.sin(angle) * baseVelocity;
      return {
        x,
        y,
        vx,
        vy,
        size,
        color,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    };
    const populateStars = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i += 1) {
        stars.push(spawnStar(true));
      }
    };
    const updateStar = (star: Star, dt: number) => {
      if (cursorReactive && pointer.active) {
        const dx = pointer.x - star.x;
        const dy = pointer.y - star.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 16000) {
          const influence = speedFactor * 0.02;
          const invDist = 1 / Math.sqrt(distSq + 0.0001);
          star.vx += dx * invDist * influence;
          star.vy += dy * invDist * influence;
        }
      }
      star.x += (star.vx * dt) / 16.67;
      star.y += (star.vy * dt) / 16.67;
      if (
        star.x < -100 ||
        star.x > stageWidth + 100 ||
        star.y < -100 ||
        star.y > stageHeight + 100
      ) {
        const replacement = spawnStar();
        star.x = replacement.x;
        star.y = replacement.y;
        star.vx = replacement.vx;
        star.vy = replacement.vy;
        star.size = replacement.size;
        star.color = replacement.color;
        star.twinklePhase = replacement.twinklePhase;
      } else if (twinkle) {
        star.twinklePhase += Math.random() * 0.05;
      }
    };
    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      for (const star of stars) {
        const sparkle = twinkle
          ? 0.6 + 0.4 * Math.sin(timestamp * 0.003 + star.twinklePhase)
          : 1;
        ctx.globalAlpha = sparkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * sparkle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    let lastFrame = performance.now();
    const loop = (now: number) => {
      const dt = now - lastFrame;
      lastFrame = now;
      for (const star of stars) {
        updateStar(star, dt);
      }
      render(now);
      animationId = requestAnimationFrame(loop);
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointer.active = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };
    resize();
    populateStars();
    animationId = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    if (cursorReactive) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
    }
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      if (cursorReactive) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, [
    starCount,
    spawnStrategy,
    speed,
    colorMode,
    customColors,
    cursorReactive,
    twinkle,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
