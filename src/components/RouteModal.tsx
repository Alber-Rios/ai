import React, { useState, useEffect } from 'react';
import { RouteStep } from '../data/routeStepsData';
import { X, ChevronLeft, ChevronRight, BookOpen, Layers, Award, Terminal, Check } from 'lucide-react';

interface RouteModalProps {
  step: RouteStep | null;
  onClose: () => void;
  onSelectStep: (stepId: number) => void;
  totalSteps: number;
  initialLevel?: 0 | 1 | 2; // 0 = Peras, 1 = Técnica, 2 = Matemática
}

export const RouteModal: React.FC<RouteModalProps> = ({
  step,
  onClose,
  onSelectStep,
  totalSteps,
  initialLevel = 0,
}) => {
  const [level, setLevel] = useState<0 | 1 | 2>(initialLevel);

  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel, step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!step) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && step.id < totalSteps) onSelectStep(step.id + 1);
      if (e.key === 'ArrowLeft' && step.id > 1) onSelectStep(step.id - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onClose, onSelectStep, totalSteps]);

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-7 text-slate-100 space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                <span>PASO {step.id} DE {totalSteps}</span>
                <span>·</span>
                <span className="text-slate-400">Ruta Colab</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {step.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          {step.shortSummary}
        </p>

        {/* 3-Level Depth Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setLevel(0)}
            className={`flex-1 min-w-[140px] py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              level === 0
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍐 1. Peras y Manzanas
          </button>
          <button
            onClick={() => setLevel(1)}
            className={`flex-1 min-w-[140px] py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              level === 1
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚙️ 2. Explicación Técnica
          </button>
          <button
            onClick={() => setLevel(2)}
            className={`flex-1 min-w-[140px] py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              level === 2
                ? 'bg-indigo-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ∑ 3. Matemáticas
          </button>
        </div>

        {/* Concepts Badges */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase">
            Conceptos involucrados:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {step.concepts.map((concept, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-cyan-300"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Level Content */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-slate-800 pb-1.5">
            {level === 0 && '🐍 Código Python Línea a Línea (con Peras y Manzanas)'}
            {level === 1 && '⚙️ Código Python Línea a Línea (Explicación Técnica de Ingeniería)'}
            {level === 2 && '∑ Fundamento Matemático, Tensores y Fórmulas'}
          </h4>

          {/* Level 0: Peras y Manzanas */}
          {level === 0 && (
            <div className="space-y-2.5">
              {step.linesSimple.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs"
                >
                  <code className="sm:col-span-5 font-mono text-cyan-200 bg-slate-900 p-2 rounded border border-slate-800/80 overflow-x-auto">
                    {item.code}
                  </code>
                  <div className="sm:col-span-7 bg-amber-950/30 border-l-3 border-amber-400 pl-3 py-1.5 text-amber-200/90 leading-relaxed flex items-center">
                    <span>🍐 {item.simple}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Level 1: Technical */}
          {level === 1 && (
            <div className="space-y-2.5">
              {step.linesSimple.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs"
                >
                  <code className="sm:col-span-5 font-mono text-cyan-200 bg-slate-900 p-2 rounded border border-slate-800/80 overflow-x-auto">
                    {item.code}
                  </code>
                  <div className="sm:col-span-7 bg-cyan-950/30 border-l-3 border-cyan-400 pl-3 py-1.5 text-slate-300 leading-relaxed flex items-center">
                    <span>⚙️ {step.linesTechnical[idx] || item.simple}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Level 2: Mathematics */}
          {level === 2 && (
            <div className="space-y-2.5">
              {step.mathFormulas.map((math, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-1.5"
                >
                  <div className="font-mono text-indigo-300 text-sm font-bold bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto">
                    {math.formula}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {math.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real World Impact */}
        <div className="p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-xs space-y-1">
          <span className="font-bold text-emerald-400 block flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            ¿Dónde se usa esto en el mundo real? (Operación Portuaria)
          </span>
          <p className="text-slate-300 leading-relaxed">
            {step.realWorldUse}
          </p>
        </div>

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectStep(step.id - 1)}
            disabled={step.id <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Paso Anterior</span>
          </button>

          <span className="font-mono text-slate-500 text-[11px]">
            Usa las flechas ← / → de tu teclado
          </span>

          <button
            onClick={() => onSelectStep(step.id + 1)}
            disabled={step.id >= totalSteps}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Paso Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
