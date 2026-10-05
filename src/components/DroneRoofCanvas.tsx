import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ContainerClassId } from '../types/notebook';
import { CONTAINER_CLASSES } from '../data/notebookData';
import { RefreshCw, Eye, Sparkles, Sliders, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface DroneRoofCanvasProps {
  selectedClass: ContainerClassId;
  onSelectClass?: (c: ContainerClassId) => void;
  showGradCam?: boolean;
  showAugmentation?: boolean;
  activeStageId?: string;
}

export const DroneRoofCanvas: React.FC<DroneRoofCanvasProps> = ({
  selectedClass,
  onSelectClass,
  showGradCam = false,
  showAugmentation = false,
  activeStageId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [seed, setSeed] = useState<number>(42);
  const [containerColorIndex, setContainerColorIndex] = useState<number>(1); // Default blue
  const [gradCamActive, setGradCamActive] = useState<boolean>(showGradCam);
  const [augActive, setAugActive] = useState<boolean>(showAugmentation);
  const [dentCount, setDentCount] = useState<number>(2);
  const [confidence, setConfidence] = useState<number>(0.96);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Sync with props
  useEffect(() => {
    setGradCamActive(showGradCam);
  }, [showGradCam]);

  useEffect(() => {
    setAugActive(showAugmentation);
  }, [showAugmentation]);

  // When stage changes, trigger smooth visual transition effect
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [activeStageId, selectedClass]);

  // Container color palette from notebook: [R, G, B]
  const CONTAINER_COLORS = [
    { name: 'Rojo Maersk', rgb: [166, 31, 26] },
    { name: 'Azul MSC', rgb: [26, 71, 148] },
    { name: 'Verde Evergreen', rgb: [31, 107, 64] },
    { name: 'Gris Hapag-Lloyd', rgb: [148, 153, 158] },
    { name: 'Amarillo DHL', rgb: [204, 178, 38] },
  ];

  // Procedural generation replicating PyTorch code in real-time
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 224;
    const height = 224;
    canvas.width = width;
    canvas.height = height;

    // Pseudo-random generator seeded
    let s = seed;
    const pseudoRand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Container geometry bounds
    const y0 = Math.floor(46 + pseudoRand() * 12);
    const y1 = height - Math.floor(46 + pseudoRand() * 12);
    const x0 = Math.floor(18 + pseudoRand() * 8);
    const x1 = width - Math.floor(18 + pseudoRand() * 8);

    const baseColor = CONTAINER_COLORS[containerColorIndex % CONTAINER_COLORS.length].rgb;
    const corrugationPeriod = 9.0 + pseudoRand() * 2.5;

    // Dent definitions for Class 2
    interface Dent {
      cx: number;
      cy: number;
      sx: number;
      sy: number;
      amp: number;
    }
    const dents: Dent[] = [];
    if (selectedClass === 2) {
      const numDents = Math.max(1, dentCount);
      for (let d = 0; d < numDents; d++) {
        dents.push({
          cx: x0 + 35 + pseudoRand() * (x1 - x0 - 70),
          cy: y0 + 20 + pseudoRand() * (y1 - y0 - 40),
          sx: 14 + pseudoRand() * 14,
          sy: 14 + pseudoRand() * 14,
          amp: 0.9 + pseudoRand() * 0.4,
        });
      }
    }

    // Rust centers for Class 1
    interface RustPatch {
      cx: number;
      cy: number;
      radius: number;
    }
    const rustPatches: RustPatch[] = [];
    if (selectedClass === 1) {
      const patchCount = 3 + Math.floor(pseudoRand() * 3);
      for (let p = 0; p < patchCount; p++) {
        rustPatches.push({
          cx: x0 + 25 + pseudoRand() * (x1 - x0 - 50),
          cy: y0 + 15 + pseudoRand() * (y1 - y0 - 30),
          radius: 20 + pseudoRand() * 25,
        });
      }
    }

    // Dock stripe position (simulate 60% chance dock edge)
    const hasDock = true;
    const dockSide = 0; // Top dock stripe
    const dockWidth = 24;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const isInsideRoof = x >= x0 && x < x1 && y >= y0 && y < y1;
        const isBorder = isInsideRoof && (x < x0 + 5 || x >= x1 - 5 || y < y0 + 5 || y >= y1 - 5);

        let r = 0;
        let g = 0;
        let b = 0;

        if (!isInsideRoof) {
          // --- Fondo Marino con oleaje + muelle ---
          if (hasDock && y < dockWidth) {
            // Muelle/Cubierta gris
            const concreteNoise = Math.sin(x * 0.3) * 8 + Math.cos(y * 0.4) * 8;
            r = 100 + concreteNoise;
            g = 105 + concreteNoise;
            b = 110 + concreteNoise;
          } else {
            // Mar con oleaje azul profundo
            const wave = Math.sin(x * 0.08 + y * 0.04) * 12 + Math.cos(x * 0.04 - y * 0.06) * 10;
            const foam = (Math.sin(x * 0.25) * Math.cos(y * 0.25) > 0.7 ? 40 : 0);
            r = Math.max(0, 12 + wave * 0.4 + foam);
            g = Math.max(0, 56 + wave * 0.8 + foam);
            b = Math.max(0, 90 + wave * 1.2 + foam * 1.5);
          }
        } else if (isBorder) {
          // --- Marco Perimetral del Contenedor ---
          r = baseColor[0] * 0.45;
          g = baseColor[1] * 0.45;
          b = baseColor[2] * 0.45;
        } else {
          // --- Techo de Acero Corrugado ---
          let deformVal = 0;
          let gradX = 0;
          let gradY = 0;

          if (selectedClass === 2) {
            // Calcular deformación gaussiana 2D
            for (const dent of dents) {
              const dx = (x - dent.cx) / dent.sx;
              const dy = (y - dent.cy) / dent.sy;
              const d2 = dx * dx + dy * dy;
              const gVal = dent.amp * Math.exp(-0.5 * d2);
              deformVal += gVal;
              // Gradiente numérico para sombreado direccional (como torch.gradient)
              gradX += -dx / dent.sx * gVal;
              gradY += -dy / dent.sy * gVal;
            }
          }

          // Onda de costillas: sin(2*pi * (x + 22 * deform) / periodo)
          const deformedX = x + 22 * deformVal;
          const rib = 0.5 + 0.5 * Math.sin((2 * Math.PI * deformedX) / corrugationPeriod);
          const ribBrightness = 0.78 + 0.32 * rib;

          r = baseColor[0] * ribBrightness;
          g = baseColor[1] * ribBrightness;
          b = baseColor[2] * ribBrightness;

          // Sombreado 3D de abolladura
          if (selectedClass === 2 && deformVal > 0.01) {
            const shadow = 1 + 8.0 * (gradX + gradY) - 0.3 * deformVal;
            r = Math.min(255, Math.max(0, r * shadow));
            g = Math.min(255, Math.max(0, g * shadow));
            b = Math.min(255, Math.max(0, b * shadow));
          }

          // Suciedad y micro-textura general
          const dirt = (Math.sin(x * 0.7) * Math.cos(y * 0.7)) * 8;
          r += dirt;
          g += dirt;
          b += dirt;

          // Óxido (Clase 1)
          if (selectedClass === 1) {
            let rustAlpha = 0;
            for (const patch of rustPatches) {
              const dist = Math.hypot(x - patch.cx, y - patch.cy);
              if (dist < patch.radius) {
                const normalizedDist = dist / patch.radius;
                // Simulación de función sigmoide y manchas
                const localNoise = Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.3;
                const alpha = Math.max(0, 1 - normalizedDist + localNoise);
                rustAlpha = Math.max(rustAlpha, alpha * 0.95);
              }
            }

            if (rustAlpha > 0.05) {
              // Color de óxido: café-naranja oxidado [140, 60, 20]
              const rustR = 145 + Math.sin(x * 0.5) * 15;
              const rustG = 65 + Math.cos(y * 0.5) * 10;
              const rustB = 22;
              r = r * (1 - rustAlpha) + rustR * rustAlpha;
              g = g * (1 - rustAlpha) + rustG * rustAlpha;
              b = b * (1 - rustAlpha) + rustB * rustAlpha;

              // Picaduras de corrosión profunda (puntos oscuros)
              if (Math.sin(x * 1.5) * Math.cos(y * 1.5) > 0.85) {
                r *= 0.5;
                g *= 0.5;
                b *= 0.5;
              }
            }
          }
        }

        // Ruido de sensor del dron (torch.randn pequeño)
        const sensorNoise = (Math.random() - 0.5) * 12;
        r = Math.min(255, Math.max(0, r + sensorNoise));
        g = Math.min(255, Math.max(0, g + sensorNoise));
        b = Math.min(255, Math.max(0, b + sensorNoise));

        // Grad-CAM Heatmap Overlay
        if (gradCamActive) {
          let heat = 0;
          if (selectedClass === 2) {
            // Concentrado en las abolladuras
            for (const dent of dents) {
              const dist = Math.hypot(x - dent.cx, y - dent.cy);
              heat = Math.max(heat, Math.exp(-dist / (dent.sx * 1.4)));
            }
          } else if (selectedClass === 1) {
            // Concentrado en las manchas de óxido
            for (const patch of rustPatches) {
              const dist = Math.hypot(x - patch.cx, y - patch.cy);
              heat = Math.max(heat, Math.exp(-dist / (patch.radius * 1.1)));
            }
          } else {
            // Para techo intacto: atención dispersa en las costillas y marco
            if (isInsideRoof && !isBorder) {
              heat = 0.35 + 0.25 * Math.sin(x * 0.05);
            } else {
              heat = 0.05; // Mínima atención al mar
            }
          }

          heat = Math.min(1, Math.max(0, heat));
          // Jet colormap: blue -> cyan -> yellow -> red
          const jetR = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(heat * 4 - 3))));
          const jetG = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(heat * 4 - 2))));
          const jetB = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(heat * 4 - 1))));

          const alpha = 0.52;
          r = r * (1 - alpha) + jetR * alpha;
          g = g * (1 - alpha) + jetG * alpha;
          b = b * (1 - alpha) + jetB * alpha;
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Apply data augmentation effects if toggled
    if (augActive) {
      ctx.save();
      // Subtle rotation and flip visual indicator
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.restore();
    }
  }, [seed, containerColorIndex, selectedClass, dentCount, gradCamActive, augActive]);

  useEffect(() => {
    drawSimulation();
  }, [drawSimulation]);

  const currentClassInfo = CONTAINER_CLASSES[selectedClass];

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
      {/* Top Header with Interactive Class Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-mono text-cyan-400">
            Vista Aérea Simulada · Tensor [3, 224, 224]
          </span>
        </div>

        {/* 3 Interactive Buttons for Classes */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {CONTAINER_CLASSES.map((c) => {
            const isActive = selectedClass === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClass && onSelectClass(c.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Clase {c.id}: {c.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stage: Drone Viewport & Telemetry HUD */}
      <div className="relative mt-3 flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Canvas Frame with Drone HUD */}
        <div className="relative group overflow-hidden rounded-lg border border-slate-700 bg-black shadow-2xl">
          <canvas
            ref={canvasRef}
            className={`w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] image-rendering-pixelated transition-transform duration-300 ${
              isTransitioning ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'
            }`}
          />

          {/* Drone Crosshairs HUD */}
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-2 rounded">
            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            {/* Drone Telemetry Overlay */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[10px] font-mono text-cyan-300">
              ALT: 14.8m · NADIR 90°
            </div>

            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[10px] font-mono text-slate-300">
              RES: 224×224 · RGB uint8
            </div>

            {/* Detection result tag */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded border border-slate-700 text-[10px] font-mono font-medium flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: currentClassInfo.color }}
              />
              <span className="text-white">{currentClassInfo.shortName}</span>
              <span className="text-cyan-400 tabular-nums">{(confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Real-time Controls & Inspector Panel */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch gap-2.5 text-xs text-slate-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                {selectedClass === 0 && <ShieldCheck className="w-4 h-4 text-sky-400" />}
                {selectedClass === 1 && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {selectedClass === 2 && <ShieldAlert className="w-4 h-4 text-red-500" />}
                {currentClassInfo.name}
              </span>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  color: currentClassInfo.color,
                  borderColor: `${currentClassInfo.color}40`,
                  backgroundColor: `${currentClassInfo.color}15`,
                }}
              >
                {currentClassInfo.badge}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              {currentClassInfo.description}
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Decisión Operativa:</span>
                <span className="text-slate-200 font-medium text-right">{currentClassInfo.decision}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Frecuencia en Patio:</span>
                <span className="text-cyan-400 tabular-nums font-semibold">{currentClassInfo.proportion}% del inventario</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Peso en Loss (w_c):</span>
                <span className="text-amber-400 font-mono tabular-nums">
                  {selectedClass === 0 ? '0.48x' : selectedClass === 1 ? '1.67x' : '6.95x'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setGradCamActive(!gradCamActive)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all ${
                gradCamActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{gradCamActive ? 'Quitar Grad-CAM' : 'Ver Grad-CAM'}</span>
            </button>

            <button
              onClick={() => {
                setSeed((prev) => prev + 1);
                setContainerColorIndex((prev) => (prev + 1) % CONTAINER_COLORS.length);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-md font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nuevo Techo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
