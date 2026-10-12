'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, ShieldCheck, Sparkles, Trophy, CheckCircle, RefreshCw, Image as ImageIcon, Box } from 'lucide-react';

interface PrizeCard3DProps {
  rank: 1 | 2 | 3;
  title: string;
  tagline: string;
  estimatedValue: string;
  description: string;
  eligibility: string;
  modelType: 'cd70' | 'iphone17' | 'android';
  imageUrl?: string;
  fallbackImageUrl?: string;
  status: string;
  drawId?: string;
  onEnterClick?: () => void;
}

export default function PrizeCard3D({
  rank,
  title,
  tagline,
  estimatedValue,
  description,
  eligibility,
  modelType,
  imageUrl,
  fallbackImageUrl,
  status,
  onEnterClick,
}: PrizeCard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image');
  const [isRotating, setIsRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Resolved image sources
  const resolvedImage =
    rank === 1
      ? 'https://ahsanautos.pk/images/products/cd70-black-2027.webp'
      : rank === 2
      ? imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
      : imageUrl || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80';

  const localFallback =
    rank === 1
      ? '/images/cd70-black-2027.webp'
      : rank === 2
      ? 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (viewMode !== '3d') return;

    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 340;
    const height = 240;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.5);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 2.5, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Root model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Build the specific 3D Model
    if (modelType === 'cd70') {
      const bikeGroup = new THREE.Group();

      const paintBlack = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.2,
      });
      const paintGold = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
        roughness: 0.3,
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        metalness: 0.95,
        roughness: 0.1,
      });
      const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x181818,
        roughness: 0.9,
      });
      const seatLeather = new THREE.MeshStandardMaterial({
        color: 0x1f2421,
        roughness: 0.7,
      });
      const lightGlass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.8,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
      });

      // Wheels
      const wheelGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32);
      const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
      frontWheel.position.set(1.4, 0, 0);
      frontWheel.rotation.y = Math.PI / 2;
      bikeGroup.add(frontWheel);

      const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
      rearWheel.position.set(-1.4, 0, 0);
      rearWheel.rotation.y = Math.PI / 2;
      bikeGroup.add(rearWheel);

      // Hubs
      const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.2, 16);
      const fHub = new THREE.Mesh(hubGeo, chromeMat);
      fHub.rotation.z = Math.PI / 2;
      fHub.position.set(1.4, 0, 0);
      bikeGroup.add(fHub);

      const rHub = new THREE.Mesh(hubGeo, chromeMat);
      rHub.rotation.z = Math.PI / 2;
      rHub.position.set(-1.4, 0, 0);
      bikeGroup.add(rHub);

      // Frame
      const frameGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12);
      const frameMain = new THREE.Mesh(frameGeo, chromeMat);
      frameMain.rotation.z = -0.4;
      frameMain.position.set(-0.1, 0.35, 0);
      bikeGroup.add(frameMain);

      // Forks
      const forkGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12);
      const forkLeft = new THREE.Mesh(forkGeo, chromeMat);
      forkLeft.position.set(1.15, 0.65, 0.15);
      forkLeft.rotation.z = -0.35;
      bikeGroup.add(forkLeft);

      const forkRight = new THREE.Mesh(forkGeo, chromeMat);
      forkRight.position.set(1.15, 0.65, -0.15);
      forkRight.rotation.z = -0.35;
      bikeGroup.add(forkRight);

      // Handlebars
      const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 12);
      const handlebars = new THREE.Mesh(barGeo, chromeMat);
      handlebars.position.set(0.95, 1.25, 0);
      bikeGroup.add(handlebars);

      // Headlight
      const lightGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.22, 20);
      const headlight = new THREE.Mesh(lightGeo, chromeMat);
      headlight.rotation.z = Math.PI / 2;
      headlight.position.set(1.22, 1.05, 0);
      bikeGroup.add(headlight);

      const lightLens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), lightGlass);
      lightLens.rotation.y = Math.PI / 2;
      lightLens.position.set(1.33, 1.05, 0);
      bikeGroup.add(lightLens);

      // Fuel Tank (Black with 2027 Gold Graphics)
      const tankGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.1, 16);
      const tank = new THREE.Mesh(tankGeo, paintBlack);
      tank.rotation.z = 1.35;
      tank.position.set(0.25, 0.88, 0);
      tank.scale.set(1.1, 1.0, 0.7);
      bikeGroup.add(tank);

      const tankStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.325, 0.4, 16), paintGold);
      tankStripe.rotation.z = 1.35;
      tankStripe.position.set(0.25, 0.88, 0);
      tankStripe.scale.set(1.11, 1.01, 0.71);
      bikeGroup.add(tankStripe);

      // Long Dual Seat
      const seatGeo = new THREE.BoxGeometry(1.25, 0.2, 0.44);
      const seat = new THREE.Mesh(seatGeo, seatLeather);
      seat.position.set(-0.6, 0.82, 0);
      seat.rotation.z = 0.08;
      bikeGroup.add(seat);

      // Engine Block
      const engineGeo = new THREE.BoxGeometry(0.55, 0.45, 0.4);
      const engine = new THREE.Mesh(engineGeo, chromeMat);
      engine.position.set(-0.1, 0.15, 0);
      bikeGroup.add(engine);

      // Exhaust Silencer
      const exhaustGeo = new THREE.CylinderGeometry(0.07, 0.09, 1.8, 12);
      const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
      exhaust.rotation.z = 1.48;
      exhaust.position.set(-0.4, -0.15, 0.28);
      bikeGroup.add(exhaust);

      bikeGroup.scale.set(0.72, 0.72, 0.72);
      bikeGroup.position.y = -0.2;
      modelGroup.add(bikeGroup);
    } else if (modelType === 'iphone17') {
      const phoneGroup = new THREE.Group();

      const titaniumMat = new THREE.MeshStandardMaterial({
        color: 0x9a8f82,
        metalness: 0.9,
        roughness: 0.25,
      });

      const glassFront = new THREE.MeshPhysicalMaterial({
        color: 0x050508,
        transmission: 0.1,
        roughness: 0.05,
        clearcoat: 1.0,
      });

      const cameraLensMat = new THREE.MeshPhysicalMaterial({
        color: 0x111122,
        roughness: 0.02,
        metalness: 0.9,
        clearcoat: 1.0,
      });

      const bodyGeo = new THREE.BoxGeometry(1.4, 2.8, 0.15);
      const phoneBody = new THREE.Mesh(bodyGeo, titaniumMat);
      phoneGroup.add(phoneBody);

      const screenGeo = new THREE.BoxGeometry(1.34, 2.72, 0.02);
      const screen = new THREE.Mesh(screenGeo, glassFront);
      screen.position.set(0, 0, 0.08);
      phoneGroup.add(screen);

      const islandGeo = new THREE.CapsuleGeometry(0.04, 0.22, 8, 16);
      const island = new THREE.Mesh(islandGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      island.rotation.z = Math.PI / 2;
      island.position.set(0, 1.15, 0.095);
      phoneGroup.add(island);

      const plateauGeo = new THREE.BoxGeometry(0.65, 0.65, 0.06);
      const plateau = new THREE.Mesh(plateauGeo, titaniumMat);
      plateau.position.set(-0.3, 0.95, -0.1);
      phoneGroup.add(plateau);

      const lensPos = [
        [-0.42, 1.1, -0.16],
        [-0.42, 0.8, -0.16],
        [-0.18, 0.95, -0.16],
      ];
      lensPos.forEach(([x, y, z]) => {
        const ringGeo = new THREE.TorusGeometry(0.09, 0.02, 16, 24);
        const ring = new THREE.Mesh(ringGeo, titaniumMat);
        ring.position.set(x, y, z);
        phoneGroup.add(ring);

        const lensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
        const lens = new THREE.Mesh(lensGeo, cameraLensMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(x, y, z - 0.01);
        phoneGroup.add(lens);
      });

      phoneGroup.scale.set(0.78, 0.78, 0.78);
      modelGroup.add(phoneGroup);
    } else {
      const androidGroup = new THREE.Group();

      const emeraldGlass = new THREE.MeshPhysicalMaterial({
        color: 0x047857,
        metalness: 0.7,
        roughness: 0.15,
        clearcoat: 1.0,
      });

      const silverFrame = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        metalness: 0.95,
        roughness: 0.1,
      });

      const bodyGeo = new THREE.BoxGeometry(1.35, 2.85, 0.14);
      const phone = new THREE.Mesh(bodyGeo, emeraldGlass);
      androidGroup.add(phone);

      const frameGeo = new THREE.BoxGeometry(1.38, 2.88, 0.12);
      const frame = new THREE.Mesh(frameGeo, silverFrame);
      androidGroup.add(frame);

      const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
      const visor = new THREE.Mesh(
        visorGeo,
        new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 })
      );
      visor.rotation.x = Math.PI / 2;
      visor.position.set(0, 0.85, -0.1);
      androidGroup.add(visor);

      const matrixLensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
      const lensMat = new THREE.MeshStandardMaterial({ color: 0x022c22, roughness: 0.1 });
      const offsets = [
        [-0.15, 0.98],
        [0.15, 0.98],
        [-0.15, 0.72],
        [0.15, 0.72],
      ];
      offsets.forEach(([x, y]) => {
        const l = new THREE.Mesh(matrixLensGeo, lensMat);
        l.rotation.x = Math.PI / 2;
        l.position.set(x, y, -0.15);
        androidGroup.add(l);
      });

      androidGroup.scale.set(0.78, 0.78, 0.78);
      modelGroup.add(androidGroup);
    }

    // Drag controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsRotating(false);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => setIsRotating(true), 1500);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating) {
        modelGroup.rotation.y += delta * 0.6;
        modelGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [viewMode, modelType, isRotating]);

  const rankBadgeColors =
    rank === 1
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold border-amber-300'
      : rank === 2
      ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-bold border-slate-300'
      : 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold border-amber-600';

  return (
    <div
      className="glass-panel glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-emerald-900/30 bg-slate-900/80 shadow-2xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Banner with Rank Badge & View Mode Switcher */}
      <div className="p-4 pb-2 flex items-center justify-between z-10 gap-2">
        <div className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md ${rankBadgeColors}`}>
          <Trophy className="w-3.5 h-3.5" />
          <span>{rank === 1 ? '1st Prize' : rank === 2 ? '2nd Prize' : '3rd Prize'}</span>
        </div>

        {/* View Switcher: Photo vs 3D */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('image')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              viewMode === 'image'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              viewMode === '3d'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D View</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display (Image or 3D Canvas) */}
      <div className="relative w-full h-[250px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950/60 to-slate-900/40 p-4">
        {viewMode === 'image' ? (
          /* High-Res Product Image */
          <div className="relative w-full h-full flex items-center justify-center group/img">
            {/* Subtle glow circle backdrop */}
            <div className="absolute inset-0 m-auto w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <img
              src={imgError ? localFallback : resolvedImage}
              alt={title}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)] group-hover/img:scale-105 transition-transform duration-300"
            />
            {rank === 1 && (
              <span className="absolute bottom-1 left-2 text-[10px] bg-slate-950/80 text-amber-400 px-2 py-0.5 rounded-md border border-white/10 font-mono">
                CD 70 Black 2027
              </span>
            )}
          </div>
        ) : (
          /* Interactive 3D Canvas Container */
          <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing group/canvas">
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5 opacity-80 group-hover/canvas:opacity-100 transition whitespace-nowrap">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Drag to Rotate 360°</span>
            </div>
            <button
              onClick={() => setIsRotating(!isRotating)}
              title="Toggle auto rotation"
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-emerald-400 border border-white/10 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
            <span className="text-sm font-semibold text-amber-400 whitespace-nowrap">{estimatedValue}</span>
          </div>
          <p className="text-xs text-emerald-400 font-medium mb-3">{tagline}</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{description}</p>

          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-white/5 space-y-1.5 mb-5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{eligibility}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Status: <strong className="text-slate-200">{status}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onEnterClick}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Participate for PKR 10</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-2">
            Earn 1 extra bonus entry per verified friend invited
          </p>
        </div>
      </div>
    </div>
  );
}
