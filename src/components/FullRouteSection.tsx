import React, { useState } from 'react';
import { ROUTE_STEPS, RouteStep } from '../data/routeStepsData';
import { RouteModal } from './RouteModal';
import { BookOpen, ArrowRight, Sparkles, Award } from 'lucide-react';

interface FullRouteSectionProps {
  isSimpleMode?: boolean;
}

export const FullRouteSection: React.FC<FullRouteSectionProps> = ({ isSimpleMode = true }) => {
  const [selectedStep, setSelectedStep] = useState<RouteStep | null>(null);

  const routePills = [
    { num: '0', title: 'Entorno', desc: 'Librerías', stepId: 1 },
    { num: '1', title: 'Datos', desc: '1.500 RGB', stepId: 3 },
    { num: '2', title: 'Preparación', desc: 'Transform + Split', stepId: 4 },
    { num: '3', title: 'Modelo', desc: 'ResNet-18', stepId: 8 },
    { num: '4', title: 'Aprendizaje', desc: 'Loss + Adam', stepId: 9 },
    { num: '5', title: 'Entrenamiento', desc: '8-10 Épocas', stepId: 11 },
    { num: '6', title: 'Evaluación', desc: 'Métricas + Matriz', stepId: 15 },
    { num: '7', title: 'Explicabilidad', desc: 'Grad-CAM', stepId: 17 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>RUTA COMPLETA DEL NOTEBOOK · 18 PASOS DESDE CERO HASTA GRAD-CAM</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
          La Receta Completa: 18 Pasos de Ingeniería Explicados en 3 Niveles
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Haz clic en cualquier tarjeta para abrir la ventana con tres niveles de profundidad:
          <strong> 🍐 Peras y Manzanas</strong>, <strong> ⚙️ Explicación Técnica</strong> o <strong> ∑ Fórmulas Matemáticas</strong>.
        </p>

        {/* Milestone Pills Strip */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1">
          {routePills.map((pill, idx) => (
            <React.Fragment key={pill.num}>
              <button
                onClick={() => setSelectedStep(ROUTE_STEPS.find((s) => s.id === pill.stepId) || null)}
                className="flex flex-col items-center justify-center min-w-[110px] p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 hover:bg-slate-900 transition-all text-center group cursor-pointer shadow-xs"
              >
                <span className="font-mono text-[10px] text-cyan-400 font-bold">
                  {pill.num} · {pill.title}
                </span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {pill.desc}
                </span>
              </button>
              {idx < routePills.length - 1 && (
                <span className="text-slate-600 font-bold text-xs shrink-0">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Grid of 18 Numbered Route Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ROUTE_STEPS.map((step) => (
          <div
            key={step.id}
            onClick={() => setSelectedStep(step)}
            className="group relative cursor-pointer rounded-xl p-4 border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-cyan-400/80 transition-all duration-200 flex flex-col justify-between shadow-md hover:-translate-y-0.5"
          >
            {/* Step Number in Watermark */}
            <span className="absolute top-2 right-3 font-mono text-3xl font-extrabold text-slate-800 group-hover:text-slate-700 transition-colors pointer-events-none select-none">
              {String(step.id).padStart(2, '0')}
            </span>

            {/* Title & Icon */}
            <div className="space-y-1 mb-3 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-lg">{step.icon}</span>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {step.shortSummary}
              </p>
            </div>

            {/* Bottom Tag & Click Affordance */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                <span>{step.concepts.length} conceptos</span>
              </div>
              <span className="flex items-center gap-1 font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                <span>Ver 3 niveles</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive 3-Level Modal */}
      {selectedStep && (
        <RouteModal
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
          onSelectStep={(stepId) => setSelectedStep(ROUTE_STEPS.find((s) => s.id === stepId) || null)}
          totalSteps={ROUTE_STEPS.length}
          initialLevel={isSimpleMode ? 0 : 1}
        />
      )}
    </div>
  );
};
