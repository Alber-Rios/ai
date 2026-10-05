import React, { useState } from 'react';
import {
  CONFUSION_MATRIX_CELLS,
  CONTAINER_CLASSES,
} from '../data/notebookData';
import { ConfusionMatrixCell, ContainerClassId } from '../types/notebook';
import {
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Info,
  DollarSign,
  Ship,
  Sliders,
} from 'lucide-react';

export const InteractiveMatrix: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<ConfusionMatrixCell>(
    CONFUSION_MATRIX_CELLS.find((c) => c.real === 2 && c.pred === 0) ||
      CONFUSION_MATRIX_CELLS[0]
  );
  const [dentThreshold, setDentThreshold] = useState<number>(0.33);

  const getClassShortName = (id: ContainerClassId) =>
    CONTAINER_CLASSES[id].shortName;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner explaining Asymmetric Operational Costs */}
      <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>Asimetría Crítica de Costos en AeroCargo Inspect (Indicador 3.3)</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          En este problema portuario, <strong className="text-white">los errores no cuestan lo mismo</strong>.
          Una falsa alarma (retener un techo sano) cuesta una breve reinspección humana (~$50 USD). En
          contraste, un <strong>falso negativo crítico</strong> (aprobar un techo abollado para carga en buque)
          significa que al apilar 5 contenedores de 30 toneladas encima, la columna puede colapsar en altamar,
          provocando pérdidas millonarias y riesgo vital.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3x3 Matrix Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-cyan-400">
              MATRIZ DE CONFUSIÓN 3×3 (CONJUNTO DE PRUEBA N=225)
            </span>
            <span className="text-[11px] text-slate-400">
              Filas = Real · Columnas = Predicho
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[11px] font-mono text-slate-500 text-left">
                    Real \ Pred
                  </th>
                  {CONTAINER_CLASSES.map((c) => (
                    <th
                      key={c.id}
                      className="p-2 text-xs font-semibold text-slate-300 border-b border-slate-800"
                    >
                      {c.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTAINER_CLASSES.map((rowClass) => (
                  <tr key={rowClass.id}>
                    <td className="p-2.5 text-xs font-semibold text-slate-300 text-left border-r border-slate-800">
                      {rowClass.shortName}
                    </td>
                    {CONTAINER_CLASSES.map((colClass) => {
                      const cell = CONFUSION_MATRIX_CELLS.find(
                        (item) =>
                          item.real === rowClass.id && item.pred === colClass.id
                      );
                      if (!cell) return <td key={colClass.id}>-</td>;

                      const isSelected =
                        selectedCell.real === cell.real &&
                        selectedCell.pred === cell.pred;
                      const isCriticalFN = cell.real === 2 && cell.pred === 0;
                      const isDiagonal = cell.real === cell.pred;

                      let cellBg = 'bg-slate-950/70 hover:bg-slate-800';
                      let cellText = 'text-slate-200';
                      let borderStyle = 'border-slate-800/80';

                      if (isDiagonal) {
                        cellBg = 'bg-cyan-950/50 hover:bg-cyan-900/60';
                        cellText = 'text-cyan-300 font-bold';
                        borderStyle = 'border-cyan-800/60';
                      } else if (isCriticalFN) {
                        cellBg = 'bg-red-950/70 hover:bg-red-900/80 animate-pulse';
                        cellText = 'text-red-300 font-bold';
                        borderStyle = 'border-red-600 ring-2 ring-red-500/60';
                      } else if (cell.status === 'grave') {
                        cellBg = 'bg-amber-950/50 hover:bg-amber-900/60';
                        cellText = 'text-amber-300';
                        borderStyle = 'border-amber-700/60';
                      }

                      if (isSelected) {
                        borderStyle = 'ring-2 ring-cyan-400 shadow-md';
                      }

                      return (
                        <td key={colClass.id} className="p-1.5">
                          <button
                            onClick={() => setSelectedCell(cell)}
                            className={`w-full py-3 px-2 rounded-lg border text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${cellBg} ${cellText} ${borderStyle}`}
                          >
                            <span className="text-base font-bold tabular-nums">
                              {cell.count}
                            </span>
                            <span className="text-[10px] opacity-80 font-mono">
                              ({cell.percentage}%)
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block text-[10px]">Exactitud Global:</span>
              <span className="text-cyan-400 font-bold text-sm tabular-nums">96.88%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block text-[10px]">Macro-F1 Score:</span>
              <span className="text-white font-bold text-sm tabular-nums">0.962</span>
            </div>
            <div className="p-2.5 rounded-lg border border-red-900/50 bg-red-950/30">
              <span className="text-red-400 block text-[10px]">Recall Daño Crítico:</span>
              <span className="text-red-300 font-bold text-sm tabular-nums">95.45%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block text-[10px]">Falsos Negativos Críticos:</span>
              <span className="text-emerald-400 font-bold text-sm tabular-nums">0 casos</span>
            </div>
          </div>
        </div>

        {/* Selected Cell Operational Impact Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-cyan-400 font-bold">
                DIAGNÓSTICO OPERACIONAL DEL ERROR
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  selectedCell.status === 'critico'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : selectedCell.status === 'grave'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : selectedCell.status === 'acierto'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedCell.status}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">{selectedCell.title}</h3>
              <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2">
                <span>Real: {getClassShortName(selectedCell.real)}</span>
                <span>→</span>
                <span>Predicho: {getClassShortName(selectedCell.pred)}</span>
                <span>·</span>
                <span className="text-cyan-400 font-bold">{selectedCell.count} casos</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 leading-relaxed text-xs">
              {selectedCell.operationalImpact}
            </div>

            {selectedCell.real === 2 && selectedCell.pred === 0 && (
              <div className="p-2.5 rounded bg-red-950/60 border border-red-700/80 text-red-200 text-[11px] space-y-1">
                <span className="font-bold block">⚠️ Protocolo de Mitigación en PyTorch:</span>
                <p>
                  Por esta razón se calibró <code>CrossEntropyLoss(weight=pesos_clase)</code>,
                  donde el peso asignado a la clase 2 es de <strong>6.95x</strong> en relación
                  al techo intacto (0.48x). De esta forma, el gradiente penaliza drásticamente
                  cualquier confusión que pase por alto un daño estructural.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Threshold Slider for Safety Triage */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Calibración de Umbral para Daño Crítico
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {(dentThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.60"
              step="0.05"
              value={dentThreshold}
              onChange={(e) => setDentThreshold(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <p className="text-[10px] text-slate-400">
              Al bajar el umbral a {Math.round(dentThreshold * 100)}%, el sistema maximiza el
              Recall de daño crítico a expensas de pequeñas falsas alarmas controlables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
