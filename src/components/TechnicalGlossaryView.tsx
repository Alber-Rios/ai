import React, { useState } from 'react';
import { TECHNICAL_GLOSSARY, TechnicalConcept } from '../data/technicalGlossary';
import {
  Search,
  BookOpen,
  Terminal,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Sliders,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

export const TechnicalGlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Conceptos (27)' },
    { id: 'parametros', label: 'Parámetros & Semillas' },
    { id: 'arquitectura', label: 'Arquitectura & Capas' },
    { id: 'entrenamiento', label: 'Entrenamiento & Adam' },
    { id: 'metricas', label: 'Métricas & Matriz' },
    { id: 'gradcam', label: 'Grad-CAM & Hooks' },
  ];

  const filteredConcepts = TECHNICAL_GLOSSARY.filter((concept) => {
    const matchesCategory =
      selectedCategory === 'all' || concept.category === selectedCategory;
    const matchesSearch =
      concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.originalQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.fullExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>GUÍA TÉCNICA MAESTRA · CONSULTAS DEL CUADERNO PYTORCH</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Explicación Rigurosa de Conceptos, Parámetros y Matemáticas
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Respuestas fundamentadas para cada una de las dudas técnicas planteadas: desde por qué la
          semilla 42 y la resolución 224, hasta el funcionamiento interno de Autograd, la capa lineal
          <code>fc</code>, Adam, Weight Decay, Hooks y la media espacial en Grad-CAM.
        </p>

        {/* Search Bar & Category Filters */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por concepto (ej. semilla 42, tam 224, login, grad cam, hooks, web de kay...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Concept Cards Feed */}
      <div className="space-y-4">
        {filteredConcepts.map((concept) => (
          <div
            key={concept.id}
            id={concept.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-md"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 mb-0.5">
                  <span className="uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                    {concept.category}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">Pregunta: "{concept.originalQuery}"</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {concept.term}
                </h3>
              </div>

              <div className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                {concept.shortDefinition}
              </div>
            </div>

            {/* Deep Technical Explanation */}
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {concept.fullExplanation}
            </div>

            {/* Optional Code Snippet */}
            {concept.codeSnippet && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden text-xs font-mono">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Código PyTorch en el Notebook:
                  </span>
                  <button
                    onClick={() => handleCopyCode(concept.codeSnippet!, concept.id)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === concept.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar código</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed text-[11px] selection:bg-cyan-500/30">
                  <code>{concept.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Two Side-by-Side Context Boxes: Analogy & Operational Consequence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Analogía Intuitiva:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {concept.analogia}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-cyan-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Importancia en la Evaluación & Operación:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {concept.consecuenciaOperativa}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredConcepts.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No se encontraron conceptos para "{searchTerm}". Prueba buscando "semilla", "adam",
            "fc", "login", "gradcam" o "hooks".
          </div>
        )}
      </div>
    </div>
  );
};
