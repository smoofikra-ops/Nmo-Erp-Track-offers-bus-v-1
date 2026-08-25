import React, { useEffect, useRef, useState } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface NodePosition {
  id: string;
  cx: number;
  cy: number;
  depth: number; // 1 (far), 2 (mid), 3 (near)
  color: string;
  glowColor: string;
  floatDelay: number;
  floatDuration: number;
  rotateBase: number;
}

export function Spatial3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check reduced motion and touch capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Mouse move listener with normalized coordinates (-1 to 1)
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setTargetPos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTouchDevice, prefersReducedMotion]);

  // Smooth spring / lerp animation loop
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return;

    let animFrameId: number;
    const lerpFactor = 0.045; // ultra-smooth fluid dampening

    const tick = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * lerpFactor,
        y: prev.y + (targetPos.y - prev.y) * lerpFactor,
      }));
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [targetPos, isTouchDevice, prefersReducedMotion]);

  // Node positions in percentage relative to spatial viewport (0-100%)
  // Visual story:
  // Employees (Node 1) -> Inventory (Node 2) -> Quotes (Node 3) -> Fleet (Node 4) -> Commissions (Node 5) -> Analytics (Node 6) -> Rejeen AI Core (Node 7)
  const nodes: NodePosition[] = [
    {
      id: 'employee',
      cx: 16,
      cy: 22,
      depth: 1.15, // mid-near
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      floatDelay: 0,
      floatDuration: 6.2,
      rotateBase: -4,
    },
    {
      id: 'inventory',
      cx: 48,
      cy: 14,
      depth: 0.9, // mid
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      floatDelay: 1.2,
      floatDuration: 7.0,
      rotateBase: 6,
    },
    {
      id: 'quotes',
      cx: 82,
      cy: 26,
      depth: 1.25, // near
      color: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      floatDelay: 2.1,
      floatDuration: 6.5,
      rotateBase: -8,
    },
    {
      id: 'fleet',
      cx: 24,
      cy: 62,
      depth: 1.35, // foreground near
      color: '#0ea5e9',
      glowColor: 'rgba(14, 165, 233, 0.45)',
      floatDelay: 0.8,
      floatDuration: 5.8,
      rotateBase: 4,
    },
    {
      id: 'commissions',
      cx: 78,
      cy: 70,
      depth: 1.2, // near
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      floatDelay: 1.8,
      floatDuration: 6.4,
      rotateBase: -5,
    },
    {
      id: 'reports',
      cx: 44,
      cy: 82,
      depth: 0.85, // background mid
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      floatDelay: 2.7,
      floatDuration: 7.5,
      rotateBase: 8,
    },
    {
      id: 'rejeen_ai',
      cx: 52,
      cy: 46,
      depth: 1.45, // center hero node
      color: '#a855f7',
      glowColor: 'rgba(168, 85, 247, 0.55)',
      floatDelay: 0.5,
      floatDuration: 5.2,
      rotateBase: 0,
    },
  ];

  // Helper to calculate exact transform for each 3D object based on depth and mouse position
  const getObjectTransform = (node: NodePosition) => {
    if (prefersReducedMotion || isTouchDevice) {
      return `translate3d(0px, 0px, 0px)`;
    }
    const moveFactor = 16 * node.depth;
    const moveX = mousePos.x * moveFactor;
    const moveY = mousePos.y * moveFactor;
    const tiltX = mousePos.y * -6 * node.depth;
    const tiltY = mousePos.x * 7 * node.depth;
    const zOffset = (node.depth - 1) * 35;

    return `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, ${zOffset.toFixed(2)}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] select-none pointer-events-none"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background Spatial Atmosphere / Dark Digital Cosmos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        {/* Soft Radial Center Glow for Rejeen AI & Connected Ecosystem */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent blur-[80px] transition-transform duration-700 ease-out"
          style={{
            transform: prefersReducedMotion
              ? 'translate(-50%, -50%)'
              : `translate(calc(-50% + ${mousePos.x * 12}px), calc(-50% + ${mousePos.y * 12}px))`,
          }}
        />

        {/* Ambient Secondary Depth Orbs */}
        <div
          className="absolute top-[20%] left-[25%] w-[200px] h-[200px] rounded-full bg-blue-600/10 blur-[70px]"
          style={{
            transform: prefersReducedMotion
              ? 'none'
              : `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
          }}
        />
        <div
          className="absolute bottom-[20%] right-[25%] w-[220px] h-[220px] rounded-full bg-emerald-600/10 blur-[70px]"
          style={{
            transform: prefersReducedMotion
              ? 'none'
              : `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
          }}
        />
      </div>

      {/* Interconnecting Optical Data Trails (SVG Constellation) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible opacity-60"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient lines connecting the operations */}
          <linearGradient id="trail-blue-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="trail-amber-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="trail-cyan-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="trail-emerald-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="trail-cyan-ai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.7" />
          </linearGradient>

          {/* Glow Filter for Data Trails */}
          <filter id="data-trail-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trail: Employees (16,22) -> Inventory (48,14) */}
        <path
          d="M 16 22 Q 32 12, 48 14"
          fill="none"
          stroke="url(#trail-blue-purple)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
          className="animate-[dash_25s_linear_infinite]"
        />

        {/* Trail: Inventory (48,14) -> Quotes (82,26) */}
        <path
          d="M 48 14 Q 66 16, 82 26"
          fill="none"
          stroke="url(#trail-amber-purple)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
          className="animate-[dash_20s_linear_infinite]"
        />

        {/* Trail: Quotes (82,26) -> Commissions (78,70) */}
        <path
          d="M 82 26 Q 86 50, 78 70"
          fill="none"
          stroke="url(#trail-emerald-indigo)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
        />

        {/* Trail: Employees (16,22) -> Fleet (24,62) */}
        <path
          d="M 16 22 Q 17 42, 24 62"
          fill="none"
          stroke="url(#trail-cyan-emerald)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
        />

        {/* Trail: Fleet (24,62) -> Reports (44,82) */}
        <path
          d="M 24 62 Q 32 76, 44 82"
          fill="none"
          stroke="url(#trail-cyan-emerald)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
        />

        {/* Trail: Reports (44,82) -> Commissions (78,70) */}
        <path
          d="M 44 82 Q 62 82, 78 70"
          fill="none"
          stroke="url(#trail-emerald-indigo)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.5"
          filter="url(#data-trail-glow)"
        />

        {/* Neural Hub Spokes: Rejeen AI Core (52,46) to All Outer Nodes */}
        <path
          d="M 52 46 L 16 22"
          fill="none"
          stroke="url(#trail-blue-purple)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />
        <path
          d="M 52 46 L 48 14"
          fill="none"
          stroke="url(#trail-amber-purple)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />
        <path
          d="M 52 46 L 82 26"
          fill="none"
          stroke="url(#trail-blue-purple)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />
        <path
          d="M 52 46 L 24 62"
          fill="none"
          stroke="url(#trail-cyan-ai)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />
        <path
          d="M 52 46 L 78 70"
          fill="none"
          stroke="url(#trail-emerald-indigo)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />
        <path
          d="M 52 46 L 44 82"
          fill="none"
          stroke="url(#trail-cyan-ai)"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          strokeDasharray="0.8 1.2"
        />

        {/* Subtle Constellation Intersecting Rings */}
        <circle
          cx="52"
          cy="46"
          r="15"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="0.2"
          strokeOpacity="0.25"
          strokeDasharray="2 3"
        />
        <circle
          cx="52"
          cy="46"
          r="28"
          fill="none"
          stroke="#6366f1"
          strokeWidth="0.15"
          strokeOpacity="0.15"
          strokeDasharray="3 4"
        />
      </svg>

      {/* ========================================================================= */}
      {/* 3D FLOATING OBJECTS (Zero text, pure high-craft spatial modules)          */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* 1. PROFESSIONAL EMPLOYEE / WORKFORCE NODE (Top-Left)                      */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-10"
        style={{
          top: '22%',
          left: '16%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[0])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 animate-floating"
          style={{
            animationDuration: `${nodes[0].floatDuration}s`,
            animationDelay: `${nodes[0].floatDelay}s`,
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-blue-500/25 blur-xl pointer-events-none" />

          {/* 3D Isometric Biometric Workforce Node */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="emp-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="emp-grad-side" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="emp-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.1)" />
              </linearGradient>
            </defs>

            {/* Base Shadow */}
            <ellipse cx="50" cy="85" rx="30" ry="8" fill="rgba(0,0,0,0.5)" filter="blur(3px)" />

            {/* Tiered Hexagonal Platform Bottom */}
            <polygon points="50,68 82,50 82,58 50,76 18,58 18,50" fill="url(#emp-grad-side)" />
            {/* Platform Top */}
            <polygon points="50,34 82,50 50,66 18,50" fill="url(#emp-grad-top)" />
            <polygon points="50,34 82,50 50,66 18,50" fill="url(#emp-glass)" />

            {/* Glowing Concentric Orbital Ring */}
            <ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="6 3" opacity="0.8" />

            {/* Floating 3D Executive Avatar Silhouette Glass Core */}
            <circle cx="50" cy="36" r="10" fill="#dbeafe" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
            <path d="M 32 60 C 32 47, 68 47, 68 60 Z" fill="#93c5fd" opacity="0.9" />

            {/* Hierarchy Connection Nodes */}
            <circle cx="28" cy="42" r="3" fill="#60a5fa" />
            <circle cx="72" cy="42" r="3" fill="#60a5fa" />
            <circle cx="50" cy="20" r="2.5" fill="#38bdf8" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 2. INVENTORY & WAREHOUSE CUBE (Top-Center)                                */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-10"
        style={{
          top: '14%',
          left: '48%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[1])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-18 h-18 sm:w-22 sm:h-22 animate-floating"
          style={{
            animationDuration: `${nodes[1].floatDuration}s`,
            animationDelay: `${nodes[1].floatDelay}s`,
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-amber-500/25 blur-xl pointer-events-none" />

          {/* 3D Isometric Logistics Package / Distribution Container */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="cube-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="cube-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            {/* Ground Shadow */}
            <ellipse cx="50" cy="88" rx="28" ry="7" fill="rgba(0,0,0,0.6)" filter="blur(4px)" />

            {/* Isometric Left Face */}
            <polygon points="50,48 20,33 20,68 50,83" fill="url(#cube-left)" />
            {/* Isometric Right Face */}
            <polygon points="50,48 80,33 80,68 50,83" fill="url(#cube-right)" />
            {/* Isometric Top Face */}
            <polygon points="50,18 80,33 50,48 20,33" fill="url(#cube-top)" />

            {/* High-Precision Laser Security Band & Etchings */}
            <polygon points="50,18 60,23 30,38 20,33" fill="rgba(255,255,255,0.3)" />
            <line x1="50" y1="48" x2="50" y2="83" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="20" y1="50" x2="50" y2="65" stroke="#fcd34d" strokeWidth="1.2" opacity="0.6" />
            <line x1="50" y1="65" x2="80" y2="50" stroke="#fcd34d" strokeWidth="1.2" opacity="0.6" />

            {/* Glowing Smart Hologram Tag on Right Face */}
            <polygon points="58,47 72,40 72,55 58,62" fill="rgba(254,240,138,0.2)" stroke="#fef08a" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 3. QUOTATION & COMMERCIAL AGREEMENT SLAB (Top-Right)                       */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-10"
        style={{
          top: '26%',
          left: '82%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[2])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-18 h-18 sm:w-22 sm:h-22 animate-floating"
          style={{
            animationDuration: `${nodes[2].floatDuration}s`,
            animationDelay: `${nodes[2].floatDelay}s`,
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/25 blur-xl pointer-events-none" />

          {/* 3D Isometric Acrylic Smart Document Slab with Verified Seal */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="doc-face" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="doc-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3730a3" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>

            {/* Ground Shadow */}
            <ellipse cx="52" cy="86" rx="26" ry="7" fill="rgba(0,0,0,0.5)" filter="blur(3px)" />

            {/* Extruded 3D Edge */}
            <polygon points="26,26 76,14 76,20 26,32" fill="url(#doc-edge)" />
            <polygon points="76,14 76,74 72,80 72,20" fill="url(#doc-edge)" />

            {/* Document Main Isometric Plane */}
            <polygon points="26,20 72,10 72,74 26,84" fill="url(#doc-face)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            {/* Debossed Commercial Tabular Content Lines */}
            <line x1="34" y1="30" x2="64" y2="24" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="34" y1="40" x2="56" y2="36" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="34" y1="48" x2="62" y2="43" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="34" y1="56" x2="50" y2="53" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" />

            {/* Verified Gold / Amber Seal Node */}
            <circle cx="58" cy="66" r="6.5" fill="#fbbf24" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
            <circle cx="58" cy="66" r="4" fill="#d97706" />
            <circle cx="58" cy="66" r="2" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 4. COMMERCIAL FLEET / VEHICLE 3D OBJECT (Mid-Left Foreground)             */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-20"
        style={{
          top: '62%',
          left: '24%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[3])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-22 h-22 sm:w-28 sm:h-28 animate-floating"
          style={{
            animationDuration: `${nodes[3].floatDuration}s`,
            animationDelay: `${nodes[3].floatDelay}s`,
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-3xl bg-cyan-500/30 blur-2xl pointer-events-none" />

          {/* 3D Isometric Commercial Transporter / Freight Vehicle */}
          <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="cab-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="cab-side" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <linearGradient id="cargo-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <linearGradient id="cargo-side" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>
            </defs>

            {/* Vehicle Undercarriage Shadow */}
            <ellipse cx="60" cy="82" rx="42" ry="10" fill="rgba(0,0,0,0.65)" filter="blur(4px)" />

            {/* Main Freight Box Top */}
            <polygon points="45,22 92,34 68,48 20,36" fill="url(#cargo-top)" />
            {/* Main Freight Box Side */}
            <polygon points="20,36 68,48 68,70 20,58" fill="url(#cargo-side)" />
            {/* Main Freight Box Rear */}
            <polygon points="68,48 92,34 92,56 68,70" fill="url(#cab-side)" />

            {/* Aerodynamic Cab Front Top */}
            <polygon points="12,48 24,42 36,49 24,56" fill="url(#cab-top)" />
            {/* Cab Windshield Glass */}
            <polygon points="14,48 24,43 28,49 18,54" fill="#38bdf8" opacity="0.85" />
            {/* Cab Front Bumper */}
            <polygon points="12,48 24,56 24,68 12,60" fill="url(#cab-side)" />

            {/* Glowing Headlights & Status Beam */}
            <polygon points="11,54 18,58 18,63 11,59" fill="#fef08a" filter="drop-shadow(0 0 4px #fef08a)" />
            <line x1="8" y1="58" x2="2" y2="62" stroke="#fef08a" strokeWidth="1.5" opacity="0.8" />

            {/* 3D Wheel Pods */}
            <ellipse cx="28" cy="66" rx="6" ry="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <ellipse cx="58" cy="74" rx="7" ry="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <ellipse cx="78" cy="69" rx="6" ry="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />

            {/* Streamlined Fleet Logistics Laser Line */}
            <line x1="22" y1="46" x2="66" y2="57" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 5. FINANCIAL GROWTH & COMMISSION PRISM (Mid-Right Foreground)             */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-20"
        style={{
          top: '70%',
          left: '78%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[4])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-20 h-20 sm:w-26 sm:h-26 animate-floating"
          style={{
            animationDuration: `${nodes[4].floatDuration}s`,
            animationDelay: `${nodes[4].floatDelay}s`,
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/30 blur-2xl pointer-events-none" />

          {/* 3D Isometric Stepped Financial Yield Prism with Glowing Trajectory */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="bar1-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="bar1-side" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="bar-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Base Shadow */}
            <ellipse cx="50" cy="86" rx="32" ry="8" fill="rgba(0,0,0,0.6)" filter="blur(4px)" />

            {/* Step Bar 1 (Lowest) */}
            <polygon points="20,54 32,48 32,74 20,80" fill="url(#bar1-side)" />
            <polygon points="32,48 44,54 44,80 32,74" fill="#065f46" />
            <polygon points="20,54 32,48 44,54 32,60" fill="url(#bar1-top)" />

            {/* Step Bar 2 (Medium) */}
            <polygon points="38,40 50,34 50,68 38,74" fill="url(#bar1-side)" />
            <polygon points="50,34 62,40 62,74 50,68" fill="#065f46" />
            <polygon points="38,40 50,34 62,40 50,46" fill="url(#bar1-top)" />

            {/* Step Bar 3 (Peak Commission Cylinder) */}
            <polygon points="56,24 68,18 68,60 56,66" fill="url(#bar1-side)" />
            <polygon points="68,18 80,24 80,66 68,60" fill="#065f46" />
            <polygon points="56,24 68,18 80,24 68,30" fill="url(#bar-gold)" />

            {/* Glowing Golden Ascending Trajectory Vector */}
            <path
              d="M 24 50 Q 50 36, 74 16"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px #34d399)"
            />
            {/* Top Yield Node Spark */}
            <circle cx="74" cy="16" r="4.5" fill="#a7f3d0" filter="drop-shadow(0 0 6px #10b981)" />
            <circle cx="74" cy="16" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 6. ANALYTICS & REPORTING CYLINDRICAL RADAR (Bottom-Center)                */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-10"
        style={{
          top: '82%',
          left: '44%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[5])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-18 h-18 sm:w-22 sm:h-22 animate-floating"
          style={{
            animationDuration: `${nodes[5].floatDuration}s`,
            animationDelay: `${nodes[5].floatDelay}s`,
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/25 blur-xl pointer-events-none" />

          {/* 3D Segmented Telemetry Donut / Metric Dial */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="radar-base" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#164e63" />
              </linearGradient>
              <linearGradient id="radar-slice1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Base Shadow */}
            <ellipse cx="50" cy="80" rx="30" ry="8" fill="rgba(0,0,0,0.5)" filter="blur(3px)" />

            {/* Outer Lower Cylinder Base */}
            <ellipse cx="50" cy="54" rx="34" ry="16" fill="#0e7490" />
            <path d="M 16 54 C 16 68, 84 68, 84 54 L 84 62 C 84 76, 16 76, 16 62 Z" fill="#155e75" />

            {/* Concentric Telemetry Slices at Different Elevations */}
            <path d="M 50 54 L 80 44 C 84 52, 72 62, 50 64 Z" fill="url(#radar-slice1)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
            <path d="M 50 54 L 20 46 C 26 38, 44 38, 50 42 Z" fill="#67e8f9" />

            {/* Center Dial Axis & Upward Analytics Light Beam */}
            <ellipse cx="50" cy="50" rx="8" ry="4" fill="#a5f3fc" />
            <line x1="50" y1="50" x2="50" y2="28" stroke="#67e8f9" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="50" cy="28" r="3" fill="#ffffff" filter="drop-shadow(0 0 5px #22d3ee)" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 7. REJEEN AI CORE — CENTRAL INTELLIGENCE NODE (Center Heart)              */}
      {/* ------------------------------------------------------------------------- */}
      <div
        className="absolute z-30"
        style={{
          top: '46%',
          left: '52%',
          transform: `translate(-50%, -50%) ${getObjectTransform(nodes[6])}`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="relative w-24 h-24 sm:w-32 sm:h-32 animate-floating"
          style={{
            animationDuration: `${nodes[6].floatDuration}s`,
            animationDelay: `${nodes[6].floatDelay}s`,
          }}
        >
          {/* Radiant Deep Nebula Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/30 to-indigo-500/40 blur-2xl animate-pulse" />

          {/* 3D Faceted Quantum Intelligence Polyhedron & Gyro Rings */}
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="ai-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="ai-facet-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
              <linearGradient id="ai-facet-3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
              <linearGradient id="ai-facet-4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Core Ground Shadow */}
            <ellipse cx="60" cy="104" rx="36" ry="9" fill="rgba(0,0,0,0.65)" filter="blur(5px)" />

            {/* Outer Counter-Rotating Gyroscopic Halo Ring 1 */}
            <ellipse
              cx="60"
              cy="60"
              rx="52"
              ry="20"
              fill="none"
              stroke="url(#ai-facet-1)"
              strokeWidth="1.8"
              strokeDasharray="14 6"
              opacity="0.8"
              transform="rotate(-25 60 60)"
            />

            {/* Inner Gyroscopic Ring 2 */}
            <ellipse
              cx="60"
              cy="60"
              rx="44"
              ry="16"
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="1.2"
              strokeDasharray="8 4"
              opacity="0.9"
              transform="rotate(35 60 60)"
            />

            {/* 3D Octahedral / Icosahedral Crystal Core */}
            {/* Top Pyramid Facets */}
            <polygon points="60,26 84,54 60,66" fill="url(#ai-facet-1)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
            <polygon points="60,26 36,54 60,66" fill="url(#ai-facet-2)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <polygon points="60,26 84,54 74,38" fill="url(#ai-facet-4)" />
            <polygon points="60,26 36,54 46,38" fill="url(#ai-facet-2)" />

            {/* Bottom Inverted Pyramid Facets */}
            <polygon points="60,94 84,54 60,66" fill="url(#ai-facet-3)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <polygon points="60,94 36,54 60,66" fill="url(#ai-facet-2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

            {/* Central Neural Singularity Sparkle */}
            <circle cx="60" cy="60" r="8" fill="#ffffff" filter="drop-shadow(0 0 8px #f472b6)" />
            <circle cx="60" cy="60" r="4" fill="#fdf4ff" />

            {/* Sparkle Rays */}
            <line x1="60" y1="44" x2="60" y2="76" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="44" y1="60" x2="76" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="49" y1="49" x2="71" y2="71" stroke="#f0abfc" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="71" y1="49" x2="49" y2="71" stroke="#f0abfc" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
