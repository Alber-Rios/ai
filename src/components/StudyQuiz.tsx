import React, { useState } from 'react';
import { STUDY_QUIZ_QUESTIONS } from '../data/notebookData';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award } from 'lucide-react';

export const StudyQuiz: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const totalQuestions = STUDY_QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const score = STUDY_QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Award className="w-4 h-4" />
            <span>EVALUACIÓN SUMATIVA DE CONCEPTOS TÉCNICOS</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Simulador de Preguntas de Examen (Rúbrica PyTorch)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprueba tu dominio sobre Transfer Learning, Feature Extraction, Autograd, Pesos y Grad-CAM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showResults ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 block">Puntaje Final:</span>
                <span className="text-lg font-bold text-cyan-400 tabular-nums">
                  {score} / {totalQuestions} ({Math.round((score / totalQuestions) * 100)}%)
                </span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResults(true)}
              disabled={answeredCount === 0}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Verificar Respuestas ({answeredCount}/{totalQuestions})
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {STUDY_QUIZ_QUESTIONS.map((q, idx) => {
          const userAnswer = selectedAnswers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = isAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition-all ${
                showResults
                  ? isCorrect
                    ? 'border-emerald-800/80 bg-emerald-950/20'
                    : 'border-red-800/80 bg-red-950/20'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] font-bold text-cyan-400">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {q.question}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-800 bg-slate-950">
                  {q.rubricRef}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 mt-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = userAnswer === oIdx;
                  const isThisCorrect = oIdx === q.correctIndex;

                  let optClass =
                    'border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700';

                  if (showResults) {
                    if (isThisCorrect) {
                      optClass = 'border-emerald-600 bg-emerald-950/50 text-emerald-200 font-medium';
                    } else if (isSelected && !isThisCorrect) {
                      optClass = 'border-red-600 bg-red-950/50 text-red-200';
                    } else {
                      optClass = 'border-slate-800/60 bg-slate-950/40 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optClass = 'border-cyan-500 bg-cyan-950/40 text-white font-medium ring-1 ring-cyan-500/50';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`text-left p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${optClass}`}
                    >
                      <span className="font-mono text-[10px] opacity-70 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showResults && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {showResults && isSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box on Reveal */}
              {showResults && (
                <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Fundamento Técnico del Notebook:</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
