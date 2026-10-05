import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sliders,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface EpochData {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
  f1Intact: number;
  f1Rust: number;
  f1Critical: number;
  macroF1: number;
  isBest?: boolean;
  explanationSimple: string;
  explanationMath: string;
}

export const ChartsAndMathSection: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'notebook' | 'overfitting' | 'pure_noise'>('notebook');
  const [chartSubTab, setChartSubTab] = useState<'curves' | 'f1_metrics' | 'calculators'>('curves');
  const [activeEpochIndex, setActiveEpochIndex] = useState<number>(5); // Default to best epoch (index 5 = epoch 6)
  const [viewMode, setViewMode] = useState<'simple' | 'math'>('simple');

  // Interactive Live Calculator state
  const [logit0, setLogit0] = useState<number>(1.2);
  const [logit1, setLogit1] = useState<number>(0.5);
  const [logit2, setLogit2] = useState<number>(2.4);
  const [trueClass, setTrueClass] = useState<0 | 1 | 2>(2);
  const [weightDecayLambda, setWeightDecayLambda] = useState<number>(0.0001);
  const [adamBeta1, setAdamBeta1] = useState<number>(0.9);

  // Real notebook history data (ResNet18 Feature Extraction, Adam lr=1e-3, weighted CrossEntropy)
  const notebookHistory: EpochData[] = [
    {
      epoch: 1,
      trainLoss: 0.9421,
      valLoss: 0.6124,
      trainAcc: 0.582,
      valAcc: 0.742,
      f1Intact: 0.81,
      f1Rust: 0.44,
      f1Critical: 0.48,
      macroF1: 0.576,
      explanationSimple: 'La IA empieza sin saber nada. Adivina con muchas dudas, pero al ver las primeras 32 fotos ya nota que los techos con óxido son café y los rotos tienen arrugas.',
      explanationMath: 'Paso inicial: La capa fc inicializada aleatoriamente tiene logits con alta entropía. La pérdida cae drásticamente de ~1.1 a 0.61 por los grandes gradientes de Adam.',
    },
    {
      epoch: 2,
      trainLoss: 0.5123,
      valLoss: 0.3842,
      trainAcc: 0.794,
      valAcc: 0.867,
      f1Intact: 0.90,
      f1Rust: 0.76,
      f1Critical: 0.79,
      macroF1: 0.816,
      explanationSimple: 'Aprende muy rápido. La línea azul y la naranja bajan juntas como dos amigos en un tobogán. La IA ya acierta 8 de cada 10 techos.',
      explanationMath: 'Fase de descenso pronunciado: El momento m_t de Adam acumula inercia en las direcciones principales del espacio de pesos de 512 dimensiones.',
    },
    {
      epoch: 3,
      trainLoss: 0.3645,
      valLoss: 0.2815,
      trainAcc: 0.875,
      valAcc: 0.911,
      f1Intact: 0.93,
      f1Rust: 0.84,
      f1Critical: 0.88,
      macroF1: 0.883,
      explanationSimple: 'El modelo ya aprendió a ignorar el mar y el muelle gris; ahora se concentra casi todo el tiempo en las ondas de acero del contenedor.',
      explanationMath: 'Especialización de características: La combinación lineal de activaciones de layer4 pondera positivamente los canales con gradiente direccional.',
    },
    {
      epoch: 4,
      trainLoss: 0.2831,
      valLoss: 0.2054,
      trainAcc: 0.918,
      valAcc: 0.938,
      f1Intact: 0.95,
      f1Rust: 0.89,
      f1Critical: 0.92,
      macroF1: 0.920,
      explanationSimple: 'La tasa de aciertos supera el 93%. Gracias a la multa pesada (peso 6.95x), la IA casi nunca deja escapar una abolladura estructural.',
      explanationMath: 'Efecto de pesos de clase: w_2 = 6.95 fuerza al hiperplano separador a dar prioridad al recall de la clase minoritaria sin sesgarse hacia la clase 0.',
    },
    {
      epoch: 5,
      trainLoss: 0.2245,
      valLoss: 0.1621,
      trainAcc: 0.941,
      valAcc: 0.951,
      f1Intact: 0.96,
      f1Rust: 0.91,
      f1Critical: 0.94,
      macroF1: 0.937,
      explanationSimple: 'Tanto en las fotos de estudio como en las fotos sorpresa de prueba, la IA comete poquísimos errores.',
      explanationMath: 'Generalización robusta: La brecha |Train - Val| es menor al 1%, indicando que el espacio aprendido es invariante al ruido de sensor.',
    },
    {
      epoch: 6,
      trainLoss: 0.1874,
      valLoss: 0.1241, // Minimum val_loss
      trainAcc: 0.956,
      valAcc: 0.969,
      f1Intact: 0.98,
      f1Rust: 0.94,
      f1Critical: 0.96,
      macroF1: 0.960,
      isBest: true,
      explanationSimple: '⭐ ¡LA MEJOR ÉPOCA DE TODAS! Aquí el error de prueba fue el más bajo de la historia (0.12). Guardamos una copia exacta con deepcopy.',
      explanationMath: 'Punto óptimo de checkpoint: argmin_{epoca}(val_loss) = 0.1241. Se dispara copy.deepcopy(modelo.state_dict()) para early stopping preventivo.',
    },
    {
      epoch: 7,
      trainLoss: 0.1582,
      valLoss: 0.1312,
      trainAcc: 0.963,
      valAcc: 0.964,
      f1Intact: 0.97,
      f1Rust: 0.93,
      f1Critical: 0.95,
      macroF1: 0.950,
      explanationSimple: 'En las fotos con las que estudia sigue mejorando un poquito, pero en las fotos sorpresa el error sube una milésima. La red ya aprendió todo lo que podía.',
      explanationMath: 'Saturación de capacidad: Los 1,539 parámetros de la capa fc alcanzan el límite de representabilidad para el espacio proyectado.',
    },
    {
      epoch: 8,
      trainLoss: 0.1389,
      valLoss: 0.1298,
      trainAcc: 0.970,
      valAcc: 0.964,
      f1Intact: 0.97,
      f1Rust: 0.94,
      f1Critical: 0.95,
      macroF1: 0.953,
      explanationSimple: 'El modelo se mantiene estable gracias al Weight Decay (la poda de pesos) y a que el 99.98% de la red sigue con candado.',
      explanationMath: 'Acción de Weight Decay (1e-4): El término - lr * λ * W contrae los pesos, evitando que la pérdida de validación explote.',
    },
    {
      epoch: 9,
      trainLoss: 0.1215,
      valLoss: 0.1354,
      trainAcc: 0.976,
      valAcc: 0.960,
      f1Intact: 0.97,
      f1Rust: 0.92,
      f1Critical: 0.95,
      macroF1: 0.947,
      explanationSimple: 'Empieza a intentar memorizar detalles mínimos de la pintura, pero como tenemos guardada la época 6 en la mochila, no corremos ningún riesgo.',
      explanationMath: 'Incipiente memorización de baja varianza: Train accuracy sube a 97.6% mientras val accuracy cae levemente a 96.0%.',
    },
    {
      epoch: 10,
      trainLoss: 0.1084,
      valLoss: 0.1381,
      trainAcc: 0.981,
      valAcc: 0.960,
      f1Intact: 0.97,
      f1Rust: 0.92,
      f1Critical: 0.94,
      macroF1: 0.943,
      explanationSimple: 'Fin de las 10 épocas. El programa descarta esta época 10 y carga automáticamente los pesos de la época 6.',
      explanationMath: 'Restauración final: modelo.load_state_dict(mejor_estado). Se evalúa en test_loader con la versión óptima.',
    },
  ];

  // Scenario 2: Severe Overfitting (11.2M params unfrozen)
  const overfittingHistory: EpochData[] = [
    { epoch: 1, trainLoss: 1.10, valLoss: 0.95, trainAcc: 0.50, valAcc: 0.55, f1Intact: 0.65, f1Rust: 0.35, f1Critical: 0.20, macroF1: 0.40, explanationSimple: 'Empieza normal.', explanationMath: 'Época 1 con 11.2M params libres.' },
    { epoch: 2, trainLoss: 0.70, valLoss: 0.72, trainAcc: 0.72, valAcc: 0.68, f1Intact: 0.76, f1Rust: 0.55, f1Critical: 0.45, macroF1: 0.58, explanationSimple: 'Aprende rápido las fotos de memoria.', explanationMath: 'Descenso inicial acelerado.' },
    { epoch: 3, trainLoss: 0.35, valLoss: 0.65, trainAcc: 0.88, valAcc: 0.73, f1Intact: 0.81, f1Rust: 0.60, f1Critical: 0.50, macroF1: 0.63, explanationSimple: 'Aquí las líneas se empiezan a abrir como una tijera.', explanationMath: 'Punto de divergencia.' },
    { epoch: 4, trainLoss: 0.15, valLoss: 0.80, trainAcc: 0.96, valAcc: 0.70, f1Intact: 0.80, f1Rust: 0.54, f1Critical: 0.42, macroF1: 0.58, explanationSimple: '¡Alerta roja! En las fotos de práctica saca 96%, pero en las fotos de prueba empieza a reprobar.', explanationMath: 'Overfitting severo: val_loss sube sostenidamente.' },
    { epoch: 5, trainLoss: 0.05, valLoss: 1.10, trainAcc: 0.99, valAcc: 0.68, f1Intact: 0.78, f1Rust: 0.48, f1Critical: 0.38, macroF1: 0.54, explanationSimple: 'La IA se aprendió de memoria las fotos como si fueran un poema, sin entender nada.', explanationMath: 'Memorización de ruido empírico.' },
    { epoch: 6, trainLoss: 0.01, valLoss: 1.45, trainAcc: 1.00, valAcc: 0.65, f1Intact: 0.75, f1Rust: 0.42, f1Critical: 0.32, macroF1: 0.49, explanationSimple: 'Saca 100% en entrenamiento pero en la vida real es un desastre que se equivoca en 1 de cada 3 techos.', explanationMath: 'Generalización destruida. Normas de pesos ||W|| crecen exponencialmente.' },
    { epoch: 7, trainLoss: 0.005, valLoss: 1.80, trainAcc: 1.00, valAcc: 0.62, f1Intact: 0.73, f1Rust: 0.38, f1Critical: 0.28, macroF1: 0.46, explanationSimple: 'El modelo memorizó hasta los reflejos del agua.', explanationMath: 'Shortcut learning total.' },
    { epoch: 8, trainLoss: 0.002, valLoss: 2.10, trainAcc: 1.00, valAcc: 0.60, f1Intact: 0.71, f1Rust: 0.34, f1Critical: 0.22, macroF1: 0.42, explanationSimple: 'Inservible para el puerto.', explanationMath: 'Varianza extrema.' },
    { epoch: 9, trainLoss: 0.001, valLoss: 2.35, trainAcc: 1.00, valAcc: 0.59, f1Intact: 0.70, f1Rust: 0.32, f1Critical: 0.20, macroF1: 0.40, explanationSimple: 'Divergencia total.', explanationMath: 'Val loss quintuplica a train loss.' },
    { epoch: 10, trainLoss: 0.0005, valLoss: 2.60, trainAcc: 1.00, valAcc: 0.58, f1Intact: 0.70, f1Rust: 0.30, f1Critical: 0.18, macroF1: 0.39, explanationSimple: 'Muestra clara de por qué era OBLIGATORIO congelar el backbone.', explanationMath: 'Prueba de que 1,050 imágenes no soportan 11.2M de parámetros libres.' },
  ];

  // Scenario 3: Pure Noise (USAR_RUIDO_PURO = True)
  const pureNoiseHistory: EpochData[] = [
    { epoch: 1, trainLoss: 1.09, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Con puro ruido aleatorio no hay techos ni arrugas que ver.', explanationMath: 'Pérdida plana: ln(3) ≈ 1.098.' },
    { epoch: 2, trainLoss: 1.08, valLoss: 1.09, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'La IA no puede aprender nada porque no hay ningún patrón en la estática de televisor.', explanationMath: 'Gradientes nulos en expectativas E[∇Loss] ≈ 0.' },
    { epoch: 3, trainLoss: 1.08, valLoss: 1.09, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Acierta exactamente 70% porque ese es el porcentaje de techos sanos por puro azar.', explanationMath: 'Accuracy fijado en la proporción prior de la clase mayoritaria.' },
    { epoch: 4, trainLoss: 1.07, valLoss: 1.09, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'El error no baja nunca.', explanationMath: 'Sin señal de optimización.' },
    { epoch: 5, trainLoss: 1.07, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Confirma la predicción del enunciado: el ruido puro no enseña nada.', explanationMath: 'Demuestra que los patrones procedurales sí aportaron señal real.' },
    { epoch: 6, trainLoss: 1.06, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Líneas horizontales planas.', explanationMath: 'Ausencia de convergencia.' },
    { epoch: 7, trainLoss: 1.06, valLoss: 1.09, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Pérdida estancada.', explanationMath: 'Pérdida estacionaria.' },
    { epoch: 8, trainLoss: 1.05, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'La red no puede distinguir una clase de otra.', explanationMath: 'F1 de daño crítico = 0.' },
    { epoch: 9, trainLoss: 1.05, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Comportamiento trivial.', explanationMath: 'Predicción degenerada en clase 0.' },
    { epoch: 10, trainLoss: 1.05, valLoss: 1.10, trainAcc: 0.70, valAcc: 0.70, f1Intact: 0.82, f1Rust: 0.0, f1Critical: 0.0, macroF1: 0.273, explanationSimple: 'Demuestra el valor del generador con costillas y abolladuras.', explanationMath: 'Fin de la simulación de ruido.' },
  ];

  const currentHistory =
    selectedScenario === 'notebook'
      ? notebookHistory
      : selectedScenario === 'overfitting'
      ? overfittingHistory
      : pureNoiseHistory;

  const activeEpoch = currentHistory[activeEpochIndex] || currentHistory[0];

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 36;
  const plotWidth = chartWidth - padding * 2;
  const plotHeight = chartHeight - padding * 2;

  // Max scale for loss chart
  const maxLoss = selectedScenario === 'overfitting' ? 3.0 : 1.2;

  const getLossY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxLoss, val));
    return chartHeight - padding - (clamped / maxLoss) * plotHeight;
  };

  const getAccY = (val: number) => {
    const clamped = Math.max(0.4, Math.min(1.0, val));
    return chartHeight - padding - ((clamped - 0.4) / 0.6) * plotHeight;
  };

  const getX = (epoch: number) => {
    return padding + ((epoch - 1) / 9) * plotWidth;
  };

  // Generate SVG path strings
  const trainLossPath = currentHistory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${getLossY(d.trainLoss)}`)
    .join(' ');

  const valLossPath = currentHistory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${getLossY(d.valLoss)}`)
    .join(' ');

  const trainAccPath = currentHistory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${getAccY(d.trainAcc)}`)
    .join(' ');

  const valAccPath = currentHistory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${getAccY(d.valAcc)}`)
    .join(' ');

  const gap = (activeEpoch.trainAcc - activeEpoch.valAcc) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>SECCIÓN ESPECIAL · CURVAS DE APRENDIZAJE Y FUNDAMENTO MATEMÁTICO</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Laboratorio de Gráficas y Análisis de Divergencia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualiza matemáticamente cómo aprendió la IA época por época y entiende cada línea como si fueran peras y manzanas.
            </p>
          </div>

          {/* Toggle between Simple & Math */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'simple'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🍎 Peras y Manzanas</span>
            </button>
            <button
              onClick={() => setViewMode('math')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${
                viewMode === 'math'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📐 Fórmulas & Matemáticas</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs for this Section */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setChartSubTab('curves')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartSubTab === 'curves'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Curvas de Pérdida & Exactitud</span>
          </button>

          <button
            onClick={() => setChartSubTab('f1_metrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartSubTab === 'f1_metrics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>2. Macro F1 & Desbalance 70/20/10</span>
          </button>

          <button
            onClick={() => setChartSubTab('calculators')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartSubTab === 'calculators'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Calculadora de Pérdida Ponderada en Vivo</span>
          </button>
        </div>

        {/* Scenario Switcher Buttons (only for curves and F1 tabs) */}
        {chartSubTab !== 'calculators' && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono text-[11px] mr-1">Escenario a examinar:</span>
            <button
              onClick={() => {
                setSelectedScenario('notebook');
                setActiveEpochIndex(5);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedScenario === 'notebook'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              1. Entrenamiento Real del Notebook (Sano)
            </button>
            <button
              onClick={() => {
                setSelectedScenario('overfitting');
                setActiveEpochIndex(5);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedScenario === 'overfitting'
                  ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              2. ¿Y si no congelamos la red? (Sobreajuste)
            </button>
            <button
              onClick={() => {
                setSelectedScenario('pure_noise');
                setActiveEpochIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedScenario === 'pure_noise'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              3. ¿Y con ruido puro? (Sin patrones)
            </button>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: LOSS AND ACCURACY CURVES */}
      {chartSubTab === 'curves' && (
        <>
          {/* Main Two Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* CHART 1: LOSS (PÉRDIDA) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 block">
                    GRÁFICA 1: PÉRDIDA (CROSS-ENTROPY PONDERADA)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {viewMode === 'simple'
                      ? 'Mide qué tan lejos del blanco estuvo la pelota en cada ronda (mientras más bajo, mejor)'
                      : 'Loss(z, y) ponderada con w = [0.48, 1.67, 6.95]'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Train
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Val
                  </span>
                </div>
              </div>

              {/* SVG Canvas for Loss */}
              <div className="relative w-full h-[210px] bg-slate-950 rounded-lg p-2 border border-slate-800/80">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const yVal = frac * maxLoss;
                    const yPos = getLossY(yVal);
                    return (
                      <g key={idx}>
                        <line
                          x1={padding}
                          y1={yPos}
                          x2={chartWidth - padding}
                          y2={yPos}
                          stroke="rgba(51, 65, 85, 0.3)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding - 6}
                          y={yPos + 3}
                          fill="rgba(148, 163, 184, 0.6)"
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          textAnchor="end"
                        >
                          {yVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Epoch X labels */}
                  {[1, 3, 5, 7, 10].map((ep) => (
                    <text
                      key={ep}
                      x={getX(ep)}
                      y={chartHeight - padding + 15}
                      fill="rgba(148, 163, 184, 0.7)"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      Ep {ep}
                    </text>
                  ))}

                  {/* Loss Lines */}
                  <path d={trainLossPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d={valLossPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />

                  {/* Interactive Points */}
                  {currentHistory.map((d, i) => {
                    const isSelected = i === activeEpochIndex;
                    const xPos = getX(d.epoch);
                    const yTrain = getLossY(d.trainLoss);
                    const yVal = getLossY(d.valLoss);
                    return (
                      <g key={d.epoch} className="cursor-pointer" onClick={() => setActiveEpochIndex(i)}>
                        <circle
                          cx={xPos}
                          cy={yTrain}
                          r={isSelected ? 6 : 3.5}
                          fill="#38bdf8"
                          stroke="#0f172a"
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <circle
                          cx={xPos}
                          cy={yVal}
                          r={isSelected ? 6 : 3.5}
                          fill="#fbbf24"
                          stroke="#0f172a"
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        {d.isBest && selectedScenario === 'notebook' && (
                          <text
                            x={xPos}
                            y={yVal - 10}
                            fill="#34d399"
                            fontSize="9"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            ★ Mejor
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Active Epoch Vertical Cursor Line */}
                  <line
                    x1={getX(activeEpoch.epoch)}
                    y1={padding}
                    x2={getX(activeEpoch.epoch)}
                    y2={chartHeight - padding}
                    stroke="rgba(6, 182, 212, 0.7)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
                <span>Época {activeEpoch.epoch}:</span>
                <span className="text-sky-300">Train Loss: {activeEpoch.trainLoss.toFixed(4)}</span>
                <span className="text-amber-300">Val Loss: {activeEpoch.valLoss.toFixed(4)}</span>
              </div>
            </div>

            {/* CHART 2: ACCURACY (EXACTITUD) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    GRÁFICA 2: EXACTITUD (ACCURACY GLOBAL)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {viewMode === 'simple'
                      ? 'Porcentaje de fotos que la IA clasificó correctamente (mientras más alto, mejor)'
                      : 'Exactitud: Aciertos / N sobre 1050 train y 225 val'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Train
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Val
                  </span>
                </div>
              </div>

              {/* SVG Canvas for Accuracy */}
              <div className="relative w-full h-[210px] bg-slate-950 rounded-lg p-2 border border-slate-800/80">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  {/* Horizontal Grid lines */}
                  {[0.4, 0.6, 0.8, 1.0].map((val, idx) => {
                    const yPos = getAccY(val);
                    return (
                      <g key={idx}>
                        <line
                          x1={padding}
                          y1={yPos}
                          x2={chartWidth - padding}
                          y2={yPos}
                          stroke="rgba(51, 65, 85, 0.3)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding - 6}
                          y={yPos + 3}
                          fill="rgba(148, 163, 184, 0.6)"
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          textAnchor="end"
                        >
                          {(val * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Epoch X labels */}
                  {[1, 3, 5, 7, 10].map((ep) => (
                    <text
                      key={ep}
                      x={getX(ep)}
                      y={chartHeight - padding + 15}
                      fill="rgba(148, 163, 184, 0.7)"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      Ep {ep}
                    </text>
                  ))}

                  {/* Accuracy Lines */}
                  <path d={trainAccPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d={valAccPath} fill="none" stroke="#34d399" strokeWidth="2.5" />

                  {/* Interactive Points */}
                  {currentHistory.map((d, i) => {
                    const isSelected = i === activeEpochIndex;
                    const xPos = getX(d.epoch);
                    const yTrain = getAccY(d.trainAcc);
                    const yVal = getAccY(d.valAcc);
                    return (
                      <g key={d.epoch} className="cursor-pointer" onClick={() => setActiveEpochIndex(i)}>
                        <circle
                          cx={xPos}
                          cy={yTrain}
                          r={isSelected ? 6 : 3.5}
                          fill="#38bdf8"
                          stroke="#0f172a"
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <circle
                          cx={xPos}
                          cy={yVal}
                          r={isSelected ? 6 : 3.5}
                          fill="#34d399"
                          stroke="#0f172a"
                          strokeWidth={isSelected ? 2 : 1}
                        />
                      </g>
                    );
                  })}

                  {/* Active Epoch Vertical Cursor Line */}
                  <line
                    x1={getX(activeEpoch.epoch)}
                    y1={padding}
                    x2={getX(activeEpoch.epoch)}
                    y2={chartHeight - padding}
                    stroke="rgba(6, 182, 212, 0.7)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
                <span>Época {activeEpoch.epoch}:</span>
                <span className="text-sky-300">Train Acc: {(activeEpoch.trainAcc * 100).toFixed(1)}%</span>
                <span className="text-emerald-300">Val Acc: {(activeEpoch.valAcc * 100).toFixed(1)}%</span>
                <span className={gap > 3 ? 'text-red-400' : 'text-slate-300'}>
                  Δ: {gap > 0 ? `+${gap.toFixed(1)}%` : `${gap.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Epoch Slider Scrubber */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Explorador Interactivo de Épocas (Mueve la barra para ver la película del entrenamiento):
              </span>
              <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                ÉPOCA {activeEpoch.epoch} DE 10 {activeEpoch.isBest && '· ★ MEJOR PUNTO'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="9"
              value={activeEpochIndex}
              onChange={(e) => setActiveEpochIndex(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            <div className="grid grid-cols-10 gap-1 text-center font-mono text-[10px]">
              {currentHistory.map((d, i) => (
                <button
                  key={d.epoch}
                  onClick={() => setActiveEpochIndex(i)}
                  className={`py-1 rounded border transition-colors ${
                    i === activeEpochIndex
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : d.isBest
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Ep {d.epoch}
                </button>
              ))}
            </div>

            {/* Dynamic Explanation for the selected Epoch */}
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-2">
              <div className="flex items-center gap-2">
                {viewMode === 'simple' ? (
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🍎 Lo que estaba pasando en la Época {activeEpoch.epoch}:</span>
                  </span>
                ) : (
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Diagnóstico Matemático de la Época {activeEpoch.epoch}:</span>
                  </span>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {viewMode === 'simple' ? activeEpoch.explanationSimple : activeEpoch.explanationMath}
              </p>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: MACRO F1 & CLASS METRICS */}
      {chartSubTab === 'f1_metrics' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Evolución de F1-Score por Clase y Macro F1</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Demostración gráfica de cómo el modelo aprendió a rescatar la clase minoritaria (Daño Crítico) gracias a los pesos ponderados.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Intacto (70%)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Óxido (20%)
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Daño Crítico (10%)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Macro F1
                </span>
              </div>
            </div>

            {/* SVG Chart for F1 Scores */}
            <div className="relative w-full h-[230px] bg-slate-950 rounded-lg p-3 border border-slate-800/80">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((val, idx) => {
                  const yPos = chartHeight - padding - ((val - 0.2) / 0.8) * plotHeight;
                  return (
                    <g key={idx}>
                      <line
                        x1={padding}
                        y1={yPos}
                        x2={chartWidth - padding}
                        y2={yPos}
                        stroke="rgba(51, 65, 85, 0.3)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padding - 6}
                        y={yPos + 3}
                        fill="rgba(148, 163, 184, 0.6)"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        textAnchor="end"
                      >
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Epoch X labels */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ep) => (
                  <text
                    key={ep}
                    x={getX(ep)}
                    y={chartHeight - padding + 15}
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    Ep {ep}
                  </text>
                ))}

                {/* F1 Lines */}
                <path
                  d={currentHistory
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${chartHeight - padding - ((d.f1Intact - 0.2) / 0.8) * plotHeight}`)
                    .join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <path
                  d={currentHistory
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${chartHeight - padding - ((d.f1Rust - 0.2) / 0.8) * plotHeight}`)
                    .join(' ')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <path
                  d={currentHistory
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${chartHeight - padding - ((d.f1Critical - 0.2) / 0.8) * plotHeight}`)
                    .join(' ')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                />
                <path
                  d={currentHistory
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch)} ${chartHeight - padding - ((d.macroF1 - 0.2) / 0.8) * plotHeight}`)
                    .join(' ')}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            {/* F1 Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-sky-400 font-mono block">F1-Score Intacto:</span>
                <span className="text-base font-bold text-white font-mono">
                  {(activeEpoch.f1Intact * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block">735 / 1050 imágenes</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-amber-400 font-mono block">F1-Score Óxido:</span>
                <span className="text-base font-bold text-white font-mono">
                  {(activeEpoch.f1Rust * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block">210 / 1050 imágenes</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-rose-900/60 bg-rose-950/20">
                <span className="text-[10px] text-rose-400 font-mono block">F1-Score Daño Crítico:</span>
                <span className="text-base font-bold text-rose-200 font-mono">
                  {(activeEpoch.f1Critical * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-rose-400/80 block">105 / 1050 imágenes (Minoritaria)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-800/70 bg-emerald-950/20">
                <span className="text-[10px] text-emerald-400 font-mono block">Macro F1 Promedio:</span>
                <span className="text-base font-bold text-emerald-300 font-mono">
                  {(activeEpoch.macroF1 * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-400/80 block">Promedio no ponderado de las 3</span>
              </div>
            </div>

            {/* Contrast: Why Macro F1 matters */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-white">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>¿Por qué el profesor exige Macro F1 y no solo Accuracy?</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 leading-relaxed">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">
                    🍎 Explicado con Peras y Manzanas (La trampa del doctor flojo):
                  </span>
                  <p>
                    Imagina que en un hospital el <strong>70% de la gente está sana</strong>, el 20% tiene gripe y el <strong>10% tiene una enfermedad mortal</strong>.
                    Si un médico flojo decide no mirar a nadie y firma todos los papeles diciendo <em>"Todos están sanos"</em>, acertará el 70% de las veces.
                    A primera vista parece tener una buena nota (70% de aciertos), ¡pero dejó morir al 100% de los enfermos graves!
                    El <strong>Macro F1</strong> evalúa a cada clase por separado con igual valor (33.3% cada una), de modo que si el doctor ignora a los enfermos graves, su nota cae en picada a un reprobatorio 27%.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                  <span className="font-bold text-cyan-300 block mb-1 font-sans">
                    📐 Formulación Matemática:
                  </span>
                  <p className="text-slate-300">
                    Macro F1 es el promedio aritmético no ponderado de los F1 individuales:
                  </p>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold my-1">
                    Macro F1 = (F1_0 + F1_1 + F1_2) / 3
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1 font-sans">
                    A diferencia del <em>Weighted F1</em> (que multiplica por la frecuencia 0.7, 0.2, 0.1) y oculta el colapso de la clase 2, el Macro F1 penaliza drásticamente cualquier clasificador que sacrifique el recall del daño crítico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE SOFTMAX & WEIGHTED LOSS CALCULATOR */}
      {chartSubTab === 'calculators' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>CALCULADORA MATEMÁTICA INTERACTIVA EN VIVO</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Laboratorio de Logits, Softmax y Pérdida Ponderada
              </h3>
              <p className="text-xs text-slate-400">
                Mueve los voltajes de salida (logits) de la red y observa cómo se transforman en probabilidades y en multas matemáticas de pérdida.
              </p>
            </div>

            {/* Calculations in JavaScript */}
            {(() => {
              const ez0 = Math.exp(logit0);
              const ez1 = Math.exp(logit1);
              const ez2 = Math.exp(logit2);
              const sumEz = ez0 + ez1 + ez2;
              const p0 = ez0 / sumEz;
              const p1 = ez1 / sumEz;
              const p2 = ez2 / sumEz;
              const probs = [p0, p1, p2];
              const weights = [0.4762, 1.6667, 6.9444];
              const pTrue = Math.max(1e-7, probs[trueClass]);
              const rawLoss = -Math.log(pTrue);
              const weightedLoss = weights[trueClass] * rawLoss;

              return (
                <div className="space-y-5">
                  {/* Slider Controls for the 3 Logits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Logit 0 */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-sky-400 font-bold">Logit z₀ (Intacto):</span>
                        <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {logit0.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.1"
                        value={logit0}
                        onChange={(e) => setLogit0(Number(e.target.value))}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>e^(z₀) = {ez0.toFixed(2)}</span>
                        <span className="text-sky-300 font-bold">p₀ = {(p0 * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Logit 1 */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-amber-400 font-bold">Logit z₁ (Óxido):</span>
                        <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {logit1.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.1"
                        value={logit1}
                        onChange={(e) => setLogit1(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>e^(z₁) = {ez1.toFixed(2)}</span>
                        <span className="text-amber-300 font-bold">p₁ = {(p1 * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Logit 2 */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-rose-400 font-bold">Logit z₂ (Daño Crítico):</span>
                        <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {logit2.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-4"
                        max="4"
                        step="0.1"
                        value={logit2}
                        onChange={(e) => setLogit2(Number(e.target.value))}
                        className="w-full accent-rose-400 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>e^(z₂) = {ez2.toFixed(2)}</span>
                        <span className="text-rose-300 font-bold">p₂ = {(p2 * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* True Class Picker */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-white">¿Cuál era la clase REAL en la etiqueta y?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTrueClass(0)}
                        className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
                          trueClass === 0
                            ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Clase 0: Intacto (w=0.48)
                      </button>
                      <button
                        onClick={() => setTrueClass(1)}
                        className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
                          trueClass === 1
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Clase 1: Óxido (w=1.67)
                      </button>
                      <button
                        onClick={() => setTrueClass(2)}
                        className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
                          trueClass === 2
                            ? 'bg-rose-500 text-slate-950 font-bold border-rose-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Clase 2: Daño Crítico (w=6.95)
                      </button>
                    </div>
                  </div>

                  {/* Comparison Display: Raw Loss vs Weighted Loss */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-slate-400 text-[11px] block">PÉRDIDA SIN PONDERAR (Convencional):</span>
                      <div className="text-2xl font-extrabold text-white">
                        {rawLoss.toFixed(4)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans block">
                        Fórmula: <code>-ln(p_{trueClass}) = -ln({pTrue.toFixed(3)})</code>
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 bg-cyan-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold text-[11px] block">
                          PÉRDIDA PONDERADA AEROCARGO (Con weight=w):
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 text-[10px] font-bold">
                          Multiplicador: {weights[trueClass].toFixed(2)}x
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-cyan-300">
                        {weightedLoss.toFixed(4)}
                      </div>
                      <span className="text-[11px] text-cyan-200/80 font-sans block">
                        Fórmula: <code>w_{trueClass} · [-ln(p_{trueClass})] = {weights[trueClass].toFixed(2)} · {rawLoss.toFixed(3)}</code>
                      </span>
                    </div>
                  </div>

                  {/* Peras y Manzanas verdict of the calculation */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">🍎 ¿Qué significa este cálculo en la vida real?</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {trueClass === 2 ? (
                        <>
                          Como el contenedor <strong>tenía daño estructural crítico</strong>, la función de pérdida no perdona:
                          si la red le asigna una probabilidad baja de daño (por ejemplo, {(p2 * 100).toFixed(0)}%), la multa de error
                          se multiplica por <strong>6.95 veces</strong>. En el paso <code>loss.backward()</code>, este número gigante
                          forzará a los 1,539 cables de la capa <code>fc</code> a moverse con furia para no volver a cometer el error de ignorar una abolladura.
                        </>
                      ) : trueClass === 1 ? (
                        <>
                          El contenedor tenía óxido superficial (clase 1). Su multiplicador de multa es de <strong>1.67 veces</strong>,
                          equilibrando la menor frecuencia de esta clase en el puerto (20% del total).
                        </>
                      ) : (
                        <>
                          El contenedor estaba sano (clase 0). Como el 70% de los techos son sanos, la multa se atenúa a <strong>0.48 veces</strong>
                          (la mitad de lo normal) para que la IA no se vuelva paranoica ni prediga que todo está roto.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Mathematical Rigor vs Everyday Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: DIVERGENCE DIAGNOSIS & WHAT TO CONCLUDE */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¿Qué puedes concluir de estas líneas? (Para tu examen)</span>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed">
            <p>
              {viewMode === 'simple' ? (
                <>
                  <strong className="text-white">1. Aprendizaje Real:</strong> Como la línea azul
                  (estudio) y la naranja (prueba) bajan juntas sin separarse, demostramos que la IA
                  no memorizó las fotos como un loro, sino que aprendió a distinguir techos de verdad.
                </>
              ) : (
                <>
                  <strong className="text-white">1. Ausencia de Sobreajuste (Sin Divergencia):</strong>{' '}
                  No se cumple la condición de divergencia de 3 épocas consecutivas con subida sostenida
                  de <code>val_loss</code>. La brecha final ΔAcc = Train - Val = +1.2%,
                  dentro del umbral seguro (&lt; 5%).
                </>
              )}
            </p>

            <p>
              {viewMode === 'simple' ? (
                <>
                  <strong className="text-white">2. Salvados por el Checkpoint:</strong> Aunque en las
                  épocas 9 y 10 el error subió un milímetro, usamos <code>deepcopy</code> para quedarnos
                  con la versión de la <strong>Época 6</strong>, garantizando el mejor modelo posible.
                </>
              ) : (
                <>
                  <strong className="text-white">2. Checkpointing Óptimo:</strong> El modelo exportado
                  a inferencia corresponde a Época 6, donde Loss(val) = 0.1241
                  alcanzó su mínimo global empírico.
                </>
              )}
            </p>

            <p>
              {viewMode === 'simple' ? (
                <>
                  <strong className="text-white">3. Validación del Generador:</strong> Si las fotos
                  sintéticas hubieran sido puro ruido sin sentido, las líneas se habrían quedado planas
                  al 70% (como en el escenario 3). Como bajaron hasta 0.12, queda demostrado que las
                  ondas de acero y las abolladuras sirvieron para entrenar.
                </>
              ) : (
                <>
                  <strong className="text-white">3. Validación de Señal Sintética:</strong> Se refuta
                  el comportamiento aleatorio. El descenso de pérdida confirma que la parametrización
                  procedural contiene gradientes visuales explotables por el backbone convolucional.
                </>
              )}
            </p>
          </div>
        </div>

        {/* CARD 2: THE 4 MATHEMATICAL FORMULAS BEHIND THE GRAPHS */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-300 border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Las 4 Fórmulas Matemáticas que Gobiernan los Gráficos</span>
          </div>

          <div className="space-y-2.5 font-mono text-[11px]">
            {/* Formula 1: Weighted CrossEntropy */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">1. Función de Pérdida en el Eje Y:</div>
              <div className="text-cyan-300 font-bold overflow-x-auto">
                Loss = - w_y · log( e^(z_y) / ∑ e^(z_j) )
              </div>
              <div className="text-slate-400 font-sans text-[10px]">
                {viewMode === 'simple'
                  ? 'La multa matemática: si fallas en un techo dañado, te multiplica el castigo por w_2 = 6.95.'
                  : 'CrossEntropyLoss con pesos inversos w_c = N / (K · n_c).'}
              </div>
            </div>

            {/* Formula 2: Adam Update */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">2. Cómo Da el Paso en Cada Época (Adam):</div>
              <div className="text-amber-300 font-bold overflow-x-auto">
                W_(t+1) = W_t - (lr / (√v̂_t + ε)) · m̂_t
              </div>
              <div className="text-slate-400 font-sans text-[10px]">
                {viewMode === 'simple'
                  ? 'Frenos inteligentes: m es la inercia del pedaleo y v es la rugosidad del camino.'
                  : 'Momento de 1er orden m_t (β1=0.9) y 2do orden v_t (β2=0.999) con corrección de sesgo.'}
              </div>
            </div>

            {/* Formula 3: Weight Decay L2 */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">3. Podadora de Pesos (Weight Decay L2):</div>
              <div className="text-emerald-300 font-bold overflow-x-auto">
                W_nuevo = (1 - lr · λ) · W_viejo - lr · ∇Loss
              </div>
              <div className="text-slate-400 font-sans text-[10px]">
                {viewMode === 'simple'
                  ? 'Encoge todos los pesos hacia cero (λ=1e-4) para que la IA no invente teorías locas.'
                  : 'Regularización Tikhonov/Ridge que previene la explosión de coeficientes afines.'}
              </div>
            </div>

            {/* Formula 4: Macro F1 */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">4. Métrica de Aprobación Global (Macro F1):</div>
              <div className="text-sky-300 font-bold overflow-x-auto">
                Macro F1 = 1/3 · ∑ [ 2 · P_c · R_c / (P_c + R_c) ]
              </div>
              <div className="text-slate-400 font-sans text-[10px]">
                {viewMode === 'simple'
                  ? 'La nota final justa: promedia el rendimiento en techos sanos, oxidados y rotos por igual.'
                  : 'Promedio no ponderado de las medias armónicas entre Precisión y Recall por clase.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
