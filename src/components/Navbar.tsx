import React from 'react';
import { Play, Pause, RotateCcw, BookOpen, Layers } from 'lucide-react';

export type ActiveTab =
  | 'diagram'
  | 'canvas'
  | 'charts'
  | 'cnn_lab'
  | 'full_route'
  | 'matrix'
  | 'oral_exam'
  | 'glossary'
  | 'quiz';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isPlayingGuide: boolean;
  togglePlayGuide: () => void;
  resetToStart: () => void;
  currentStageNumber: string;
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPlayingGuide,
  togglePlayGuide,
  resetToStart,
  currentStageNumber,
  isSimpleMode,
  toggleSimpleMode,
}) => {
  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'diagram', label: 'Pipeline & Código' },
    { id: 'charts', label: 'Gráficas & Matemáticas', badge: 'Nuevo' },
    { id: 'cnn_lab', label: 'Lab CNN en Vivo' },
    { id: 'full_route', label: 'Ruta 18 Pasos' },
    { id: 'matrix', label: 'Matriz de Riesgo' },
    { id: 'oral_exam', label: 'Defensa Oral (10)' },
    { id: 'glossary', label: 'Glosario (27)' },
    { id: 'quiz', label: 'Test de Rúbrica' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 gap-3">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            resetToStart();
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
        >
          AeroCargo Inspect
        </a>
        <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded hidden sm:inline-block">
          PyTorch ResNet-18
        </span>
      </div>

      {/* Zone 2: Clean scrollable navigation links */}
      <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full text-xs font-medium no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary actions & Peras y Manzanas switch */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleSimpleMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-xs cursor-pointer ${
            isSimpleMode
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/60'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Alternar entre explicación con Peras y Manzanas y modo técnico de código"
        >
          <span>{isSimpleMode ? '🍎 Peras y Manzanas' : '⚡ Modo Código'}</span>
        </button>

        <button
          onClick={togglePlayGuide}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            isPlayingGuide
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
          }`}
          title="Recorre automáticamente todas las etapas con animaciones"
        >
          {isPlayingGuide ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlayingGuide ? 'Pausar' : 'Tour'}</span>
        </button>

        <button
          onClick={resetToStart}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          title="Reiniciar a la etapa inicial"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
