import React from 'react';
import { PipelineStage } from '../types/notebook';
import {
  Terminal,
  Layers,
  Sliders,
  Cpu,
  Activity,
  CheckCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  Database,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface InteractiveDiagramProps {
  stages: PipelineStage[];
  currentStageId: string;
  onSelectStage: (id: string) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  stages,
  currentStageId,
  onSelectStage,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-4 h-4" />;
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'Sliders':
        return <Sliders className="w-4 h-4" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4" />;
      case 'Eye':
        return <Eye className="w-4 h-4" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'datos':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-400',
          activeBg: 'bg-cyan-950/40 border-cyan-400 shadow-cyan-950/50',
          badge: 'text-cyan-400 bg-cyan-950 border-cyan-800',
          accent: 'text-cyan-400',
        };
      case 'modelo':
        return {
          border: 'border-indigo-500/40 hover:border-indigo-400',
          activeBg: 'bg-indigo-950/40 border-indigo-400 shadow-indigo-950/50',
          badge: 'text-indigo-400 bg-indigo-950 border-indigo-800',
          accent: 'text-indigo-400',
        };
      case 'entrenamiento':
        return {
          border: 'border-amber-500/40 hover:border-amber-400',
          activeBg: 'bg-amber-950/40 border-amber-400 shadow-amber-950/50',
          badge: 'text-amber-400 bg-amber-950 border-amber-800',
          accent: 'text-amber-400',
        };
      case 'evaluacion':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          activeBg: 'bg-emerald-950/40 border-emerald-400 shadow-emerald-950/50',
          badge: 'text-emerald-400 bg-emerald-950 border-emerald-800',
          accent: 'text-emerald-400',
        };
      case 'explicabilidad':
        return {
          border: 'border-rose-500/40 hover:border-rose-400',
          activeBg: 'bg-rose-950/40 border-rose-400 shadow-rose-950/50',
          badge: 'text-rose-400 bg-rose-950 border-rose-800',
          accent: 'text-rose-400',
        };
      default:
        return {
          border: 'border-slate-700 hover:border-slate-500',
          activeBg: 'bg-slate-800 border-slate-400',
          badge: 'text-slate-400 bg-slate-900 border-slate-700',
          accent: 'text-slate-400',
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Diagram Instructions and Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-cyan-400" />
            Flujo Arquitectónico Tensorial (Colab PyTorch)
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">
            Haz clic en cualquier bloque para inspeccionar su código y animar la simulación
          </span>
        </div>

        {/* Categories Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Datos
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Modelo
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Entrenamiento
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Evaluación
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Grad-CAM
          </span>
        </div>
      </div>

      {/* Interactive Grid of Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStageId;
          const theme = getCategoryTheme(stage.category);

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`relative group cursor-pointer rounded-xl p-3.5 border transition-all duration-200 text-left flex flex-col justify-between ${
                isActive
                  ? `${theme.activeBg} ring-1 ring-cyan-400/60 shadow-lg`
                  : `bg-slate-900/60 ${theme.border} hover:bg-slate-900`
              }`}
            >
              {/* Top Row: Step Number & Category Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span
                    className={`font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    PASO {stage.number}
                  </span>
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${theme.badge}`}
                >
                  {stage.category}
                </div>
              </div>

              {/* Title & Icon */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`${theme.accent}`}>{getIcon(stage.icon)}</span>
                  <h3
                    className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-1 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {stage.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>

              {/* Bottom Technical Indicators */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-[10px] text-slate-500">
                  {stage.codeBlocks.length} {stage.codeBlocks.length === 1 ? 'bloque' : 'bloques'}
                </span>
                <span
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    isActive ? theme.accent : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <span>{isActive ? 'Examinando' : 'Inspeccionar'}</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              {/* Active Indicator Pulse Ring */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Data Flow Bar */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tensor Pipeline:</span>
          <span className="text-slate-200">
            [3, 224, 224] uint8 → v2.Compose(Norm) → ResNet-18 Conv (512x7x7) → fc(3) → Softmax
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>T4 GPU · PyTorch Autograd Determinista</span>
        </div>
      </div>
    </div>
  );
};
