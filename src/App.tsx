import React, { useState, useEffect, useRef } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { InteractiveDiagram } from './components/InteractiveDiagram';
import { DroneRoofCanvas } from './components/DroneRoofCanvas';
import { CodeSidePanel } from './components/CodeSidePanel';
import { InteractiveMatrix } from './components/InteractiveMatrix';
import { StudyQuiz } from './components/StudyQuiz';
import { TechnicalGlossaryView } from './components/TechnicalGlossaryView';
import { ChartsAndMathSection } from './components/ChartsAndMathSection';
import { LiveCnnLab } from './components/LiveCnnLab';
import { FullRouteSection } from './components/FullRouteSection';
import { ExamQuestionsSection } from './components/ExamQuestionsSection';
import { PIPELINE_STAGES, CONTAINER_CLASSES } from './data/notebookData';
import { ContainerClassId, PipelineStage } from './types/notebook';
import {
  Compass,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info,
  Sliders,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diagram');
  const [currentStageId, setCurrentStageId] = useState<string>('generator');
  const [selectedClass, setSelectedClass] = useState<ContainerClassId>(2);
  const [isPlayingGuide, setIsPlayingGuide] = useState<boolean>(false);
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true); // Default to Peras y Manzanas!
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find active stage object
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.id === currentStageId);
  const currentStage: PipelineStage =
    currentStageIndex !== -1 ? PIPELINE_STAGES[currentStageIndex] : PIPELINE_STAGES[0];

  // Stage change handler that updates the canvas view according to the stage
  const handleSelectStage = (stageId: string) => {
    setCurrentStageId(stageId);
    const targetStage = PIPELINE_STAGES.find((s) => s.id === stageId);
    if (targetStage) {
      setSelectedClass(targetStage.defaultClassView);
    }
  };

  const handleNextStage = () => {
    const nextIdx = (currentStageIndex + 1) % PIPELINE_STAGES.length;
    handleSelectStage(PIPELINE_STAGES[nextIdx].id);
  };

  const handlePrevStage = () => {
    const prevIdx =
      (currentStageIndex - 1 + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
    handleSelectStage(PIPELINE_STAGES[prevIdx].id);
  };

  const resetToStart = () => {
    setIsPlayingGuide(false);
    handleSelectStage(PIPELINE_STAGES[0].id);
    setActiveTab('diagram');
  };

  // Automated step-by-step tour mode
  useEffect(() => {
    if (isPlayingGuide) {
      guideTimerRef.current = setInterval(() => {
        setCurrentStageId((prevId) => {
          const idx = PIPELINE_STAGES.findIndex((s) => s.id === prevId);
          const nextIdx = (idx + 1) % PIPELINE_STAGES.length;
          const nextStage = PIPELINE_STAGES[nextIdx];
          setSelectedClass(nextStage.defaultClassView);
          return nextStage.id;
        });
      }, 7000);
    } else {
      if (guideTimerRef.current) clearInterval(guideTimerRef.current);
    }
    return () => {
      if (guideTimerRef.current) clearInterval(guideTimerRef.current);
    };
  }, [isPlayingGuide]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlayingGuide={isPlayingGuide}
        togglePlayGuide={() => setIsPlayingGuide(!isPlayingGuide)}
        resetToStart={resetToStart}
        currentStageNumber={currentStage.number}
        isSimpleMode={isSimpleMode}
        toggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
      />

      {/* Main Multi-Zone App Body */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto p-3 sm:p-5 flex flex-col gap-5">
        {/* Banner with Essential Architecture Overview */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              AeroCargo Inspect · Evaluación Sumativa
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              {isSimpleMode
                ? 'Explicado con Peras y Manzanas (para quien no sabe código)'
                : 'ResNet-18 (ImageNet) · 1,500 Imágenes [3, 224, 224] · Desbalance 70/20/10'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Paso Activo:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              {currentStage.number}. {isSimpleMode ? currentStage.perasYManzanas.tituloSimple : currentStage.title}
            </span>
          </div>
        </div>

        {/* Tab 1: Interactive Diagram & Side Panel View */}
        {activeTab === 'diagram' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column: Interactive Diagram + Procedural Canvas (7 cols) */}
            <div className="xl:col-span-7 flex flex-col gap-5">
              {/* Interactive Diagram with clickable nodes */}
              <InteractiveDiagram
                stages={PIPELINE_STAGES}
                currentStageId={currentStageId}
                onSelectStage={handleSelectStage}
              />

              {/* Dynamic Procedural Container Simulator */}
              <DroneRoofCanvas
                selectedClass={selectedClass}
                onSelectClass={(c) => setSelectedClass(c)}
                showGradCam={currentStage.id === 'gradcam'}
                showAugmentation={currentStage.id === 'augmentation'}
                activeStageId={currentStage.id}
              />

              {/* Quick Concept Highlights Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50">
                  <span className="font-mono text-cyan-400 text-[10px] block uppercase font-bold">
                    {isSimpleMode ? '1. El Fotógrafo Prestado' : '1. Feature Extraction'}
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {isSimpleMode
                      ? 'Usamos el cerebro de una IA que ya vio 1 millón de fotos y le pusimos candado para que no se confunda con solo 1.050 techos.'
                      : 'Backbone congelado (requires_grad = False) con solo 1,539 parámetros entrenables en la capa fc.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50">
                  <span className="font-mono text-amber-400 text-[10px] block uppercase font-bold">
                    {isSimpleMode ? '2. Multa Pesada al Daño' : '2. Desbalance 70/20/10'}
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {isSimpleMode
                      ? 'El 70% de techos viene sano. Cobramos una multa 7 veces mayor si la IA deja pasar un techo roto para que no sea floja.'
                      : 'Ponderación analítica w_c en CrossEntropyLoss: la clase 2 pesa 6.95x frente a 0.48x del intacto.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50">
                  <span className="font-mono text-rose-400 text-[10px] block uppercase font-bold">
                    {isSimpleMode ? '3. Linterna Térmica' : '3. Explicabilidad Grad-CAM'}
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {isSimpleMode
                      ? 'Espiamos la mente de la IA para certificar que mira la abolladura de metal y no las olas del mar o el cemento del muelle.'
                      : 'Razón de enfoque 1.7x demuestra que la red atiende al defecto y descarta el aprendizaje de atajos (shortcut learning).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Side Panel Explaining Code in Depth (5 cols) */}
            <div className="xl:col-span-5 h-[calc(100vh-140px)] sticky top-[72px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <CodeSidePanel
                stage={currentStage}
                onNextStage={handleNextStage}
                onPrevStage={handlePrevStage}
                isFirstStage={currentStageIndex === 0}
                isLastStage={currentStageIndex === PIPELINE_STAGES.length - 1}
                isSimpleMode={isSimpleMode}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Drone Simulator View */}
        {activeTab === 'canvas' && (
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
              <h2 className="text-base font-bold text-white mb-1">
                Laboratorio Óptico del Dron: Inspección Procedural en Tiempo Real
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este simulador recrea el generador tensorial de PyTorch ejecutando en vivo las
                mismas fórmulas de costillas periódicas, sombreado direccional con gradientes,
                óxido y activación Grad-CAM.
              </p>
            </div>

            <DroneRoofCanvas
              selectedClass={selectedClass}
              onSelectClass={(c) => setSelectedClass(c)}
              showGradCam={currentStage.id === 'gradcam'}
              showAugmentation={currentStage.id === 'augmentation'}
              activeStageId={currentStage.id}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Charts and Math Section */}
        {activeTab === 'charts' && <ChartsAndMathSection />}

        {/* Tab 3: Interactive Live CNN & Feature Maps Lab */}
        {activeTab === 'cnn_lab' && <LiveCnnLab />}

        {/* Tab 4: 18 Complete Route Steps Explained in 3 Levels */}
        {activeTab === 'full_route' && <FullRouteSection isSimpleMode={isSimpleMode} />}

        {/* Tab 5: Interactive 3x3 Confusion Matrix & Operational Impact */}
        {activeTab === 'matrix' && <InteractiveMatrix />}

        {/* Tab 6: 10 Oral Exam Defense Questions */}
        {activeTab === 'oral_exam' && <ExamQuestionsSection />}

        {/* Tab 7: Technical Glossary of all 27 concepts */}
        {activeTab === 'glossary' && <TechnicalGlossaryView />}

        {/* Tab 8: Study Quiz & Exam Rubric Checklist */}
        {activeTab === 'quiz' && <StudyQuiz />}
      </main>

      {/* Subdued Footer */}
      <footer className="mt-8 border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>AeroCargo Inspect</span>
          <span>·</span>
          <span>Clasificación de Techos de Contenedores con CNN + Transfer Learning</span>
        </div>
        <div className="font-mono text-[11px] text-slate-600">
          PyTorch 2.x · torchvision · scikit-learn · ResNet-18
        </div>
      </footer>
    </div>
  );
}
