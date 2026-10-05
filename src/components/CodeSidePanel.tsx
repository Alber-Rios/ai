import React, { useState } from 'react';
import { PipelineStage } from '../types/notebook';
import {
  Code,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Award,
  ChevronRight,
  Terminal,
  Zap,
  Sliders,
} from 'lucide-react';

interface CodeSidePanelProps {
  stage: PipelineStage;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isFirstStage?: boolean;
  isLastStage?: boolean;
  isSimpleMode?: boolean;
}

export const CodeSidePanel: React.FC<CodeSidePanelProps> = ({
  stage,
  onNextStage,
  onPrevStage,
  isFirstStage,
  isLastStage,
  isSimpleMode = true,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'simple' | 'code' | 'breakdown' | 'lab'>(
    isSimpleMode ? 'simple' : 'code'
  );

  // Sync activeTab if user changes isSimpleMode from Navbar
  React.useEffect(() => {
    setActiveTab(isSimpleMode ? 'simple' : 'code');
  }, [isSimpleMode]);

  // Interactive Mini-Lab States
  // For Augmentation: Class weight simulator
  const [simN0, setSimN0] = useState<number>(735); // 70% of 1050
  const [simN1, setSimN1] = useState<number>(210); // 20%
  const [simN2, setSimN2] = useState<number>(105); // 10%

  // For Grad-CAM: Threshold / Ratio simulator
  const [simRoofArea, setSimRoofArea] = useState<number>(54); // 54%
  const [simCamEnergy, setSimCamEnergy] = useState<number>(92); // 92%

  // For Production Triage:
  const [dentProb, setDentProb] = useState<number>(0.45);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const totalSamples = simN0 + simN1 + simN2;
  const w0 = (totalSamples / (3.0 * (simN0 || 1))).toFixed(2);
  const w1 = (totalSamples / (3.0 * (simN1 || 1))).toFixed(2);
  const w2 = (totalSamples / (3.0 * (simN2 || 1))).toFixed(2);

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 overflow-hidden">
      {/* Side Panel Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>PASO {stage.number}</span>
            <span>·</span>
            <span className="uppercase text-slate-400">{stage.category}</span>
          </div>
          <h2 className="text-base font-bold text-white mt-0.5 leading-snug">
            {stage.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{stage.subtitle}</p>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevStage}
            disabled={isFirstStage}
            className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            title="Paso anterior"
          >
            ←
          </button>
          <button
            onClick={onNextStage}
            disabled={isLastStage}
            className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            title="Paso siguiente"
          >
            →
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs px-4 pt-1 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('simple')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'simple'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🍎 Peras y Manzanas</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'code'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Código PyTorch</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'breakdown'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Línea por Línea</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'lab'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Mini-Lab</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 0: PERAS Y MANZANAS VIEW */}
        {activeTab === 'simple' && (
          <div className="space-y-4">
            {/* Title Card */}
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950 p-4 space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                <span>🍎 Explicación Sencilla para Todo Público</span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                {stage.perasYManzanas.tituloSimple}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stage.perasYManzanas.resumenSencillo}
              </p>
            </div>

            {/* Daily Analogy Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs">
                <span>💡 La Analogía de la Vida Real:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-cyan-400 pl-3 py-1">
                "{stage.perasYManzanas.analogiaCotidiana}"
              </p>
            </div>

            {/* Why & What If Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 space-y-1">
                <span className="font-bold text-emerald-400 text-xs block">
                  ¿Por qué se hizo de esta forma? (El Gran Por Qué)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {stage.perasYManzanas.porQueSeHizoAsi}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-red-900/50 bg-red-950/20 space-y-1">
                <span className="font-bold text-red-300 text-xs block">
                  ¿Qué pasaría en el puerto si no se hace?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {stage.perasYManzanas.quePasaSiNoSeHace}
                </p>
              </div>
            </div>

            {/* Breakdown of Key Points with Apples and Pears */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                Conceptos de este paso explicados fácil:
              </span>
              {stage.perasYManzanas.puntosClave.map((pt, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/70 text-xs space-y-1"
                >
                  <div className="font-bold text-cyan-300 text-xs">
                    {pt.queEs}
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    <strong className="text-slate-200">¿Para qué sirve?</strong> {pt.porQue}
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed pt-0.5">
                    <strong className="text-amber-300">Ejemplo:</strong> {pt.ejemplo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* TAB 1: CODE VIEW */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            {/* Technical Concept Summary Box */}
            <div className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-3 text-xs leading-relaxed text-slate-300">
              <span className="font-semibold text-cyan-300 block mb-1">
                ¿Qué hace este bloque de código?
              </span>
              {stage.summary}
            </div>

            {/* Code Snippets */}
            {stage.codeBlocks.map((block, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden shadow-md"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    {block.title}
                  </span>
                  <button
                    onClick={() => copyCode(block.code, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto selection:bg-cyan-500/30">
                  <code>{block.code}</code>
                </pre>

                <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/80 text-[11px] text-amber-300/90 font-mono">
                  💡 <span className="text-slate-300">{block.keyTakeaway}</span>
                </div>
              </div>
            ))}

            {/* Rubric Points Badge Section */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Cumplimiento en la Rúbrica de Evaluación</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {stage.rubricPoints.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: LINE BY LINE BREAKDOWN */}
        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 leading-relaxed">
              Explicación rigurosa de cada operador, llamada al framework y fórmula
              matemática presente en el cuaderno.
            </div>

            {stage.codeBlocks.map((block, bIdx) => (
              <div key={bIdx} className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-cyan-400 border-b border-slate-800 pb-1">
                  Desglose: {block.title}
                </h4>

                <div className="space-y-2.5">
                  {block.lineExplanations.map((item, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {item.concept}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-cyan-200 bg-slate-900 p-1.5 rounded border border-slate-800/80 overflow-x-auto">
                        {item.lines}
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs space-y-2">
              <span className="font-semibold text-white block">
                Fundamento Teórico Profundo
              </span>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                {stage.technicalDetails}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE MINI-LAB */}
        {activeTab === 'lab' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Experimenta con las fórmulas y parámetros matemáticos en tiempo real.
            </div>

            {/* STAGE 01: TENSOR SHAPE & RESOLUTION */}
            {stage.id === 'generator' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Cálculo de Memoria en GPU para [3, 224, 224]
                </span>
                <p className="text-slate-400 text-[11px]">
                  En el cuaderno se utiliza <code>torch.uint8</code> durante la generación para
                  ocupar 4 veces menos RAM que <code>float32</code>.
                </p>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Píxeles por imagen:</span>
                    <span className="text-cyan-400 tabular-nums">3 × 224 × 224 = 150,528</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tamaño en uint8 (1 byte):</span>
                    <span className="text-emerald-400 tabular-nums">~147 KB / imagen</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tamaño en float32 (4 bytes):</span>
                    <span className="text-amber-400 tabular-nums">~588 KB / imagen</span>
                  </div>
                  <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1">
                    <span>Dataset total (1,500 imgs):</span>
                    <span className="text-white font-semibold tabular-nums">225.8 MB (uint8)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 02: CLASS WEIGHTS SIMULATOR */}
            {(stage.id === 'augmentation' || stage.id === 'setup') && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Simulador de Ponderación Analítica w_c = N / (K · n_c)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Ajusta la cantidad de muestras en cada clase para ver cómo PyTorch recalcula
                  los pesos para la función de pérdida CrossEntropy.
                </p>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Clase 0 (Intacto): {simN0}</span>
                      <span className="font-mono text-cyan-400 font-bold">Peso: {w0}x</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1000"
                      value={simN0}
                      onChange={(e) => setSimN0(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Clase 1 (Óxido): {simN1}</span>
                      <span className="font-mono text-amber-400 font-bold">Peso: {w1}x</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={simN1}
                      onChange={(e) => setSimN1(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Clase 2 (Daño Crítico): {simN2}</span>
                      <span className="font-mono text-red-400 font-bold">Peso: {w2}x</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={simN2}
                      onChange={(e) => setSimN2(Number(e.target.value))}
                      className="w-full accent-red-400"
                    />
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-cyan-300">
                  pesos_clase = torch.tensor([{w0}, {w1}, {w2}])
                </div>
              </div>
            )}

            {/* STAGE 03: RESNET-18 PARAMETER BREAKDOWN */}
            {stage.id === 'model' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Auditoría de Parámetros: Backbone vs Cabeza Lineal
                </span>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Backbone ResNet-18 (Congelado):</div>
                    <div className="text-cyan-400 font-bold text-sm">11,175,000 parámetros</div>
                    <div className="text-[10px] text-slate-500">requires_grad = False (0 bytes grad)</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60">
                    <div className="text-emerald-400 font-semibold">Capa Clasificadora fc (Entrenable):</div>
                    <div className="text-white font-bold text-sm">1,539 parámetros</div>
                    <div className="text-[10px] text-slate-400">
                      512 entradas × 3 salidas (1536) + 3 bias = 1,539
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Porcentaje entrenado:{' '}
                    <span className="font-bold text-cyan-400">0.014%</span> de la red.
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 04: TRAINING LOOP MECHANICS */}
            {stage.id === 'training' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  El Ciclo de 4 Pasos de Autograd en PyTorch
                </span>
                <ol className="space-y-2 font-mono text-[11px] list-decimal list-inside text-slate-300">
                  <li className="p-1.5 bg-slate-900 rounded">
                    <span className="text-cyan-400 font-bold">1. logits = modelo(xb)</span>
                    <p className="font-sans text-[10px] text-slate-400 ml-4">
                      Forward pass a través del grafo tensorial.
                    </p>
                  </li>
                  <li className="p-1.5 bg-slate-900 rounded">
                    <span className="text-amber-400 font-bold">2. loss = criterio(logits, yb)</span>
                    <p className="font-sans text-[10px] text-slate-400 ml-4">
                      CrossEntropy multiclase con pesos [0.48, 1.67, 6.95].
                    </p>
                  </li>
                  <li className="p-1.5 bg-slate-900 rounded">
                    <span className="text-red-400 font-bold">3. loss.backward()</span>
                    <p className="font-sans text-[10px] text-slate-400 ml-4">
                      Regla de la cadena: calcula dLoss/dW en la capa fc.
                    </p>
                  </li>
                  <li className="p-1.5 bg-slate-900 rounded">
                    <span className="text-emerald-400 font-bold">4. optimizador.step()</span>
                    <p className="font-sans text-[10px] text-slate-400 ml-4">
                      Actualización Adam de pesos con momento de 1er y 2do orden.
                    </p>
                  </li>
                </ol>
              </div>
            )}

            {/* STAGE 05: METRICS & DECISION MATRIX */}
            {stage.id === 'metrics' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Asimetría de Costos: Recall vs Precision
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <div className="font-bold text-slate-200">Falsa Alarma (FP)</div>
                    <div className="text-slate-400 mt-1">Costo: Retención temporal de contenedor sano</div>
                    <div className="text-emerald-400 font-mono mt-1">Costo: ~$50 USD</div>
                  </div>
                  <div className="p-2 bg-red-950/40 border border-red-800/60 rounded">
                    <div className="font-bold text-red-300">Falso Negativo (FN)</div>
                    <div className="text-slate-400 mt-1">Costo: Colapso estructural en alta mar</div>
                    <div className="text-red-400 font-mono font-bold mt-1">Costo: ~$250,000+ USD</div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 06: GRAD-CAM ENERGY RATIO */}
            {stage.id === 'gradcam' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Simulador Cuantitativo de Atención Focal
                </span>
                <p className="text-slate-400 text-[11px]">
                  Valida matemáticamente si la red mira el techo o si cayó en 'Shortcut Learning'.
                </p>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Área ocupada por el techo:</span>
                      <span className="font-mono text-cyan-400 font-bold">{simRoofArea}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="75"
                      value={simRoofArea}
                      onChange={(e) => setSimRoofArea(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Energía Grad-CAM dentro del techo:</span>
                      <span className="font-mono text-emerald-400 font-bold">{simCamEnergy}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="99"
                      value={simCamEnergy}
                      onChange={(e) => setSimCamEnergy(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>

                {/* Calculation Ratio */}
                {(() => {
                  const ratio = (simCamEnergy / (simRoofArea || 1)).toFixed(2);
                  const isGood = Number(ratio) > 1.2;
                  return (
                    <div
                      className={`p-2.5 rounded border text-xs font-mono ${
                        isGood
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/30 border-amber-800 text-amber-300'
                      }`}
                    >
                      <div className="font-bold">
                        Razón de Enfoque (Energía / Área): {ratio}x
                      </div>
                      <div className="font-sans text-[11px] text-slate-300 mt-1">
                        {isGood
                          ? '✅ La red concentra su atención en el contenedor 1.7x más que por azar. No usa el mar como atajo.'
                          : '⚠️ Advertencia: ratio bajo. Posible memorización espuria del fondo oceánico.'}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* STAGE 07: PRODUCTION TRIAGE TESTER */}
            {stage.id === 'audit' && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <span className="font-semibold text-white block">
                  Simulador de Umbral Triage con Human-in-the-Loop
                </span>
                <p className="text-slate-400 text-[11px]">
                  Prueba la regla de decisión portuaria variando la probabilidad de daño predicha:
                </p>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>P(Daño Crítico):</span>
                    <span className="font-mono text-red-400 font-bold">{(dentProb * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={dentProb}
                    onChange={(e) => setDentProb(Number(e.target.value))}
                    className="w-full accent-red-400"
                  />
                </div>

                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-[11px]">
                  {dentProb >= 0.4 ? (
                    <div className="text-red-400 font-bold">
                      ⛔ RECHAZO AUTOMÁTICO PARA CARGA
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Probabilidad de daño supera umbral de seguridad de 0.40.
                      </div>
                    </div>
                  ) : dentProb >= 0.15 ? (
                    <div className="text-amber-400 font-bold">
                      ⚠️ REVISIÓN HUMANA REQUERIDA (ZONA GRIS)
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Derivar caso al tablet del inspector de muelle con recorte Grad-CAM.
                      </div>
                    </div>
                  ) : (
                    <div className="text-emerald-400 font-bold">
                      ✅ CARGA AUTORIZADA
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Techo clasificado como sano con alta certeza.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
