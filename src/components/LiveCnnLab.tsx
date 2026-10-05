import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, RefreshCw, Upload, Sparkles, Eye, Check, Info, HelpCircle } from 'lucide-react';

interface KernelDef {
  name: string;
  kernel: number[];
  why: string;
}

const KERNEL_PRESETS: Record<string, KernelDef> = {
  sx: {
    name: 'Bordes verticales (Sobel X)',
    kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
    why: 'Resalta cambios de izquierda a derecha. Esencial para detectar costillas verticales del acero corrugado.',
  },
  sy: {
    name: 'Bordes horizontales (Sobel Y)',
    kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
    why: 'Resalta cambios de arriba a abajo. Detecta marcos perimetrales y abolladuras transversales.',
  },
  lap: {
    name: 'Laplaciano (Bordes omnidireccionales)',
    kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
    why: 'Reacciona fuertemente a arrugas y deformaciones circulares en el metal.',
  },
  sharp: {
    name: 'Realce / Sharpen',
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    why: 'Aumenta el contraste local y las picaduras de óxido fino.',
  },
  blur: {
    name: 'Desenfoque / Promedio 3×3',
    kernel: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
    why: 'Suaviza y elimina ruido de sensor aleatorio del dron.',
  },
  ident: {
    name: 'Identidad',
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    why: 'Deja pasar la imagen sin alteraciones.',
  },
};

export const LiveCnnLab: React.FC = () => {
  const [selectedKernel1, setSelectedKernel1] = useState<string>('sx');
  const [selectedKernel2, setSelectedKernel2] = useState<string>('lap');
  const [poolingType, setPoolingType] = useState<'max' | 'avg'>('max');
  const [temperature, setTemperature] = useState<number>(1.0);
  const [clickX, setClickX] = useState<number>(20);
  const [clickY, setClickY] = useState<number>(20);
  const [poolClickX, setPoolClickX] = useState<number>(16);
  const [poolClickY, setPoolClickY] = useState<number>(16);
  const [inputTensor, setInputTensor] = useState<Float32Array | null>(null);

  const canvasInputRef = useRef<HTMLCanvasElement | null>(null);
  const canvasConv1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasRelu1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasPool1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasConv2Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasRelu2Ref = useRef<HTMLCanvasElement | null>(null);
  const canvasPool2Ref = useRef<HTMLCanvasElement | null>(null);

  const N = 64; // Visual processing size

  // Helper math
  const conv2D = (input: Float32Array, w: number, h: number, k: number[]) => {
    const out = new Float32Array(w * h);
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let sum = 0;
        for (let u = 0; u < 3; u++) {
          for (let v = 0; v < 3; v++) {
            const y = i + u - 1;
            const x = j + v - 1;
            if (y >= 0 && y < h && x >= 0 && x < w) {
              sum += k[u * 3 + v] * input[y * w + x];
            }
          }
        }
        out[i * w + j] = sum;
      }
    }
    return out;
  };

  const relu2D = (input: Float32Array) => {
    const out = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      out[i] = input[i] > 0 ? input[i] : 0;
    }
    return out;
  };

  const pool2D = (input: Float32Array, w: number, h: number, type: 'max' | 'avg') => {
    const W = w >> 1;
    const H = h >> 1;
    const out = new Float32Array(W * H);
    for (let i = 0; i < H; i++) {
      for (let j = 0; j < W; j++) {
        const q0 = input[2 * i * w + 2 * j];
        const q1 = input[2 * i * w + 2 * j + 1];
        const q2 = input[(2 * i + 1) * w + 2 * j];
        const q3 = input[(2 * i + 1) * w + 2 * j + 1];
        out[i * W + j] = type === 'max' ? Math.max(q0, q1, q2, q3) : (q0 + q1 + q2 + q3) / 4;
      }
    }
    return out;
  };

  const drawArrayToCanvas = (
    canvas: HTMLCanvasElement | null,
    arr: Float32Array,
    w: number,
    h: number,
    signed: boolean,
    highlightRect?: [number, number, number, number]
  ) => {
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let maxVal = 1e-9;
    for (let i = 0; i < arr.length; i++) {
      maxVal = Math.max(maxVal, Math.abs(arr[i]));
    }

    const imgData = ctx.createImageData(w, h);
    for (let i = 0; i < arr.length; i++) {
      const idx = i * 4;
      const g = signed
        ? Math.min(255, Math.max(0, 128 + (127 * arr[i]) / maxVal))
        : Math.min(255, Math.max(0, (255 * arr[i]) / maxVal));
      imgData.data[idx] = g;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = g;
      imgData.data[idx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    if (highlightRect) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(highlightRect[0] + 0.5, highlightRect[1] + 0.5, highlightRect[2] - 1, highlightRect[3] - 1);
    }
  };

  // Generate procedural sample container roof
  const generateSampleImage = useCallback(() => {
    const arr = new Float32Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        // Base corrugation ribs
        const corrugation = 0.5 + 0.5 * Math.sin((x * Math.PI * 2) / 7);
        let val = 0.45 + 0.3 * corrugation;

        // Rust spot in top right
        const distRust = Math.hypot(x - 42, y - 20);
        if (distRust < 9) {
          val += 0.35 * (1 - distRust / 9);
        }

        // Structural dent in center-left with normal gradient shadow
        const distDent = Math.hypot(x - 22, y - 36);
        if (distDent < 14) {
          const shadow = Math.sin((x - 22) * 0.3) * 0.25;
          val = Math.max(0.1, val - 0.3 * (1 - distDent / 14) + shadow);
        }

        // Border dark frame
        if (x < 3 || x >= N - 3 || y < 3 || y >= N - 3) {
          val *= 0.4;
        }

        arr[y * N + x] = Math.min(1.0, Math.max(0.0, val));
      }
    }
    setInputTensor(arr);
  }, []);

  useEffect(() => {
    generateSampleImage();
  }, [generateSampleImage]);

  // Handle image upload from user
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = N;
        offscreen.height = N;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, N, N);
        const data = ctx.getImageData(0, 0, N, N).data;
        const arr = new Float32Array(N * N);
        for (let i = 0; i < N * N; i++) {
          arr[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
        }
        setInputTensor(arr);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Run pipeline when input or parameters change
  const [pipelineOutputs, setPipelineOutputs] = useState<{
    c1: Float32Array;
    r1: Float32Array;
    p1: Float32Array;
    c2: Float32Array;
    r2: Float32Array;
    p2: Float32Array;
    logits: number[];
    probs: number[];
  } | null>(null);

  useEffect(() => {
    if (!inputTensor) return;

    const k1 = KERNEL_PRESETS[selectedKernel1].kernel;
    const k2 = KERNEL_PRESETS[selectedKernel2].kernel;

    const c1 = conv2D(inputTensor, 64, 64, k1);
    const r1 = relu2D(c1);
    const p1 = pool2D(r1, 64, 64, poolingType);

    const c2 = conv2D(p1, 32, 32, k2);
    const r2 = relu2D(c2);
    const p2 = pool2D(r2, 32, 32, poolingType); // 16x16

    // Draw all stages
    drawArrayToCanvas(canvasInputRef.current, inputTensor, 64, 64, false, [clickX - 1, clickY - 1, 3, 3]);
    drawArrayToCanvas(canvasConv1Ref.current, c1, 64, 64, true);
    drawArrayToCanvas(canvasRelu1Ref.current, r1, 64, 64, false, [poolClickX, poolClickY, 4, 4]);
    drawArrayToCanvas(canvasPool1Ref.current, p1, 32, 32, false);
    drawArrayToCanvas(canvasConv2Ref.current, c2, 32, 32, true);
    drawArrayToCanvas(canvasRelu2Ref.current, r2, 32, 32, false);
    drawArrayToCanvas(canvasPool2Ref.current, p2, 16, 16, false);

    // Compute synthetic feature vector h from final pooling
    let mean = 0;
    let max = 0;
    for (let i = 0; i < p2.length; i++) {
      mean += p2[i];
      max = Math.max(max, p2[i]);
    }
    mean /= p2.length;
    let countActive = 0;
    for (let i = 0; i < p2.length; i++) {
      if (p2[i] > 0.5 * max && max > 0) countActive++;
    }

    const h = [max > 0 ? mean / max : 0, Math.min(1, max / 2), countActive / p2.length];
    const W = [
      [0, -3.0, -2.0], // Class 0 Intact weights
      [1.0, 1.5, 0.0],  // Class 1 Rust weights
      [0, 3.0, 2.5],   // Class 2 Dent weights
    ];
    const b = [2.0, 0.2, -1.0];

    const logits = W.map((row, k) => row[0] * h[0] + row[1] * h[1] + row[2] * h[2] + b[k]);
    const maxL = Math.max(...logits);
    const expL = logits.map((v) => Math.exp((v - maxL) / temperature));
    const sumExp = expL.reduce((a, c) => a + c, 0);
    const probs = expL.map((v) => v / sumExp);

    setPipelineOutputs({ c1, r1, p1, c2, r2, p2, logits, probs });
  }, [inputTensor, selectedKernel1, selectedKernel2, poolingType, temperature, clickX, clickY, poolClickX, poolClickY]);

  // Dot product calculation for selected 3x3 patch
  const patchValues: number[] = [];
  const productValues: number[] = [];
  let convSum = 0;
  if (inputTensor) {
    const k1 = KERNEL_PRESETS[selectedKernel1].kernel;
    for (let u = 0; u < 3; u++) {
      for (let v = 0; v < 3; v++) {
        const y = clickY + u - 1;
        const x = clickX + v - 1;
        const q = y >= 0 && y < 64 && x >= 0 && x < 64 ? inputTensor[y * 64 + x] : 0;
        patchValues.push(q);
        const prod = q * k1[u * 3 + v];
        productValues.push(prod);
        convSum += prod;
      }
    }
  }

  // Pooling calculation for selected 4x4 patch
  const poolQ: number[] = [];
  const poolOuts: number[] = [];
  if (pipelineOutputs) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const idx = (poolClickY + i) * 64 + (poolClickX + j);
        poolQ.push(pipelineOutputs.r1[idx] || 0);
      }
    }
    // 4 sub-windows of 2x2
    for (let w = 0; w < 4; w++) {
      const startR = (w >> 1) * 2;
      const startC = (w % 2) * 2;
      const q0 = poolQ[startR * 4 + startC];
      const q1 = poolQ[startR * 4 + startC + 1];
      const q2 = poolQ[(startR + 1) * 4 + startC];
      const q3 = poolQ[(startR + 1) * 4 + startC + 1];
      poolOuts.push(poolingType === 'max' ? Math.max(q0, q1, q2, q3) : (q0 + q1 + q2 + q3) / 4);
    }
  }

  const classNames = ['Techo intacto', 'Óxido / corrosión leve', 'Daño crítico'];
  const bestClassIdx = pipelineOutputs ? pipelineOutputs.probs.indexOf(Math.max(...pipelineOutputs.probs)) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>LABORATORIO ÓPTICO INTERACTIVO · ARQUITECTURA CNN</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Laboratorio en Vivo: Convolución → ReLU → Pooling → Logits
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
              Procesa tu propia foto o el techo de ejemplo 100% en tu navegador. Haz clic sobre cualquier píxel de la entrada para ver la multiplicación matemática de matrices 3×3 en vivo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateSampleImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Techo con Defecto</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-700/60 bg-cyan-950/40 hover:bg-cyan-900/50 text-xs font-medium text-cyan-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto Propia</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">1er Kernel Convolucional:</label>
            <select
              value={selectedKernel1}
              onChange={(e) => setSelectedKernel1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              {Object.entries(KERNEL_PRESETS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">2do Kernel Convolucional:</label>
            <select
              value={selectedKernel2}
              onChange={(e) => setSelectedKernel2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              {Object.entries(KERNEL_PRESETS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tipo de Pooling:</label>
            <select
              value={poolingType}
              onChange={(e) => setPoolingType(e.target.value as 'max' | 'avg')}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="max">Max Pooling (Conserva la señal más fuerte)</option>
              <option value="avg">Average Pooling (Promedia la zona)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Flow Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 overflow-x-auto shadow-xl">
        <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-3">
          FLUJO ESPACIAL TENSORIAL (Haz clic en la Entrada o en ReLU 1 para mover los recuadros amarillos)
        </span>

        <div className="flex items-center gap-3 min-w-[950px] pb-2">
          {/* Stage 1: Input */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[140px]">
            <canvas
              ref={canvasInputRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.floor(((e.clientX - rect.left) / rect.width) * 64);
                const y = Math.floor(((e.clientY - rect.top) / rect.height) * 64);
                setClickX(Math.max(1, Math.min(62, x)));
                setClickY(Math.max(1, Math.min(62, y)));
              }}
              className="w-[128px] h-[128px] rounded-lg border-2 border-slate-700 image-rendering-pixelated cursor-crosshair hover:border-amber-400 transition-colors shadow-md"
              title="Pincha aquí para calcular la convolución"
            />
            <span className="text-xs font-bold text-white">1. Entrada</span>
            <span className="text-[10px] font-mono text-slate-400">64×64 píxeles</span>
          </div>

          <span className="text-slate-500 font-bold text-lg">→</span>

          {/* Stage 2: Conv 1 */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[140px]">
            <canvas
              ref={canvasConv1Ref}
              className="w-[128px] h-[128px] rounded-lg border border-slate-700 image-rendering-pixelated shadow-md"
            />
            <span className="text-xs font-bold text-cyan-300">2. Conv 1</span>
            <span className="text-[10px] font-mono text-slate-400">64×64 (con signo)</span>
          </div>

          <span className="text-slate-500 font-bold text-lg">→</span>

          {/* Stage 3: ReLU 1 */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[140px]">
            <canvas
              ref={canvasRelu1Ref}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.floor(((e.clientX - rect.left) / rect.width) * 64);
                const y = Math.floor(((e.clientY - rect.top) / rect.height) * 64);
                setPoolClickX(Math.min(60, x & ~1));
                setPoolClickY(Math.min(60, y & ~1));
              }}
              className="w-[128px] h-[128px] rounded-lg border-2 border-slate-700 image-rendering-pixelated cursor-crosshair hover:border-amber-400 transition-colors shadow-md"
              title="Pincha aquí para calcular el pooling 4x4"
            />
            <span className="text-xs font-bold text-white">3. ReLU 1</span>
            <span className="text-[10px] font-mono text-slate-400">max(0, Y) · 64×64</span>
          </div>

          <span className="text-slate-500 font-bold text-lg">→</span>

          {/* Stage 4: Pool 1 */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[110px]">
            <canvas
              ref={canvasPool1Ref}
              className="w-[96px] h-[96px] rounded-lg border border-slate-700 image-rendering-pixelated shadow-md"
            />
            <span className="text-xs font-bold text-emerald-300">4. Pool 1</span>
            <span className="text-[10px] font-mono text-slate-400">32×32 (achica 2x)</span>
          </div>

          <span className="text-slate-500 font-bold text-lg">→</span>

          {/* Stage 5: Conv 2 */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[110px]">
            <canvas
              ref={canvasConv2Ref}
              className="w-[96px] h-[96px] rounded-lg border border-slate-700 image-rendering-pixelated shadow-md"
            />
            <span className="text-xs font-bold text-cyan-300">5. Conv 2</span>
            <span className="text-[10px] font-mono text-slate-400">32×32</span>
          </div>

          <span className="text-slate-500 font-bold text-lg">→</span>

          {/* Stage 6: Pool 2 */}
          <div className="flex flex-col items-center text-center gap-1.5 w-[90px]">
            <canvas
              ref={canvasPool2Ref}
              className="w-[64px] h-[64px] rounded-lg border border-slate-700 image-rendering-pixelated shadow-md"
            />
            <span className="text-xs font-bold text-amber-300">6. Pool 2</span>
            <span className="text-[10px] font-mono text-slate-400">16×16 (vector h)</span>
          </div>
        </div>
      </div>

      {/* Two In-Depth Calculation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PANEL A: CONVOLUTION 3x3 MATH */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white text-sm">
              ① Multiplicación Matricial del Kernel (Píxel [{clickY}, {clickX}])
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Y[i,j] = ∑ K · X</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
            {/* Patch X */}
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] mb-1">Parche X (3×3)</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800">
                {patchValues.map((v, i) => (
                  <span key={i} className="w-8 h-6 flex items-center justify-center bg-slate-900 rounded text-slate-300">
                    {v.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <span className="text-slate-500 font-bold text-sm">×</span>

            {/* Kernel K */}
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] mb-1">Kernel K (3×3)</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800">
                {KERNEL_PRESETS[selectedKernel1].kernel.map((k, i) => (
                  <span key={i} className="w-8 h-6 flex items-center justify-center bg-slate-900 rounded text-amber-300 font-bold">
                    {k >= 0 ? `+${k}` : k}
                  </span>
                ))}
              </div>
            </div>

            <span className="text-slate-500 font-bold text-sm">=</span>

            {/* Sum */}
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] mb-1">Productos</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800">
                {productValues.map((p, i) => (
                  <span key={i} className="w-8 h-6 flex items-center justify-center bg-slate-900 rounded text-cyan-300">
                    {p.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed text-slate-300">
            Suma de los 9 productos: <strong className="text-white">Y[{clickY}, {clickX}] = {convSum.toFixed(3)}</strong>
            {' → '}
            Pasada por ReLU: <strong className="text-emerald-400">max(0, Y) = {Math.max(0, convSum).toFixed(3)}</strong>.
            <div className="text-slate-400 text-[11px] mt-1">
              {KERNEL_PRESETS[selectedKernel1].why}
            </div>
          </div>
        </div>

        {/* PANEL B: POOLING 4x4 WINDOW MATH */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white text-sm">
              ② Cálculo de Pooling 2×2 (Esquina [{poolClickY}, {poolClickX}])
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {poolingType === 'max' ? 'Max Pooling' : 'Average Pooling'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 font-mono text-[11px]">
            {/* 4x4 Patch */}
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] mb-1">Ventana 4×4 de ReLU 1</span>
              <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800">
                {poolQ.map((v, i) => {
                  const subWindow = (Math.floor(i / 4) >= 2 ? 2 : 0) + (i % 4 >= 2 ? 1 : 0);
                  const colors = ['border-sky-500/60', 'border-amber-500/60', 'border-emerald-500/60', 'border-rose-500/60'];
                  return (
                    <span
                      key={i}
                      className={`w-7 h-6 flex items-center justify-center bg-slate-900 rounded border ${colors[subWindow]} text-slate-300 text-[10px]`}
                    >
                      {v.toFixed(1)}
                    </span>
                  );
                })}
              </div>
            </div>

            <span className="text-slate-500 font-bold text-sm">→</span>

            {/* 2x2 Output */}
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] mb-1">Salida 2×2 Comprimida</span>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800">
                {poolOuts.map((out, i) => (
                  <span
                    key={i}
                    className="w-10 h-8 flex items-center justify-center bg-slate-900 rounded font-bold text-cyan-300 text-xs border border-cyan-500/40"
                  >
                    {out.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed text-slate-300">
            {poolingType === 'max'
              ? 'Max Pooling toma el valor más grande de cada cuadrante de 2×2, descartando la posición exacta pero conservando la señal más fuerte de fractura o textura.'
              : 'Average Pooling promedia los 4 números de cada cuadrante, suavizando el mapa y conservando el nivel medio de iluminación.'}
            <div className="text-slate-400 text-[11px] mt-1">
              Reduce la cantidad de píxeles a la cuarta parte (de 16 números a solo 4) con <strong>cero parámetros que aprender</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* PANEL C: LOGITS AND TEMPERATURE SLIDER */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div>
            <span className="font-bold text-white text-sm block">
              ③ Logits z y Calibración de Probabilidades Softmax(z / T)
            </span>
            <span className="text-[11px] text-slate-400">
              Los logits z ∈ (-∞, +∞) son puntajes brutos; la temperatura T suaviza o afila la distribución.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Temperatura T:</span>
            <input
              type="range"
              min="0.3"
              max="3.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-32 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 font-bold w-8">{temperature.toFixed(1)}</span>
          </div>
        </div>

        {pipelineOutputs && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {classNames.map((name, idx) => {
              const logit = pipelineOutputs.logits[idx];
              const prob = pipelineOutputs.probs[idx];
              const isBest = idx === bestClassIdx;
              const barWidth = Math.min(100, (Math.abs(logit) / 6) * 100);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    isBest
                      ? 'border-cyan-500/80 bg-cyan-950/30 ring-1 ring-cyan-500/50'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs flex items-center gap-1">
                      {name}
                      {isBest && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Logit Bar (Center Zero) */}
                  <div className="space-y-1 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Logit z_{idx}:</span>
                      <span className="text-slate-200 font-bold">{logit.toFixed(2)}</span>
                    </div>
                    <div className="relative h-2.5 bg-slate-900 rounded overflow-hidden border border-slate-800">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600" />
                      <div
                        className={`absolute top-0 bottom-0 ${
                          logit >= 0 ? 'bg-cyan-500 left-1/2' : 'bg-red-500 right-1/2'
                        }`}
                        style={{ width: `${barWidth / 2}%` }}
                      />
                    </div>
                  </div>

                  {/* Softmax Probability Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-white">Fundamento:</strong> Un <strong>logit</strong> es la salida afín directa sin normalizar (z = W·h + b). Puede ser negativo y no suman 1.0. Para predecir la etiqueta final, <code>argmax(z)</code> da exactamente el mismo resultado que <code>argmax(softmax(z))</code> porque la función exponencial es estrictamente creciente. En PyTorch, <code>CrossEntropyLoss</code> recibe los logits directamente y aplica log-softmax internamente para garantizar máxima estabilidad numérica y evitar desbordamientos de coma flotante.
        </div>
      </div>
    </div>
  );
};
