import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Shuffle,
  Award,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface QuestionDef {
  id: number;
  step: '4' | '5';
  question: string;
  answerStudent: string;
  keyIdea: string;
  visualType?: 'matrix' | 'gradcam' | 'dataloader' | 'softmax' | 'freeze' | 'net';
}

const EXAM_QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    step: '4',
    question: '¿Por qué llamas a optimizer.zero_grad() en cada batch?',
    answerStudent: 'Porque PyTorch va sumando los gradientes de cada batch en los tensores de parámetros. Si no los borro, el modelo se actualizaría con la información del batch anterior mezclada con la nueva, arruinando la trayectoria de optimización.',
    keyIdea: 'PyTorch acumula gradientes por defecto; zero_grad limpia la pizarra en cada iteración.',
    visualType: 'freeze',
  },
  {
    id: 2,
    step: '4',
    question: '¿Cuáles son los 4 pasos por batch que pide la pauta de evaluación?',
    answerStudent: '1) Forward: paso las imágenes por el modelo para obtener logits. 2) Loss: calculo el error con la función de pérdida ponderada. 3) Backward: calculo cuánto influyó cada peso en ese error (regla de la cadena). 4) Step: optimizer.step() actualiza los pesos de la capa lineal. Antes de todo limpio con zero_grad.',
    keyIdea: 'Forward, loss, backward, step.',
    visualType: 'freeze',
  },
  {
    id: 3,
    step: '4',
    question: '¿Qué diferencia hay entre model.train() y model.eval()?',
    answerStudent: 'model.train() pone el modelo en modo entrenamiento y model.eval() en modo evaluación. En ResNet18 esto es crítico porque contiene capas BatchNorm: en train usa la media del batch, pero en eval usa las medias acumuladas móviles para no alterar los pesos preentrenados.',
    keyIdea: 'Train/eval cambia el comportamiento de módulos como BatchNorm y Dropout.',
    visualType: 'net',
  },
  {
    id: 4,
    step: '4',
    question: '¿Por qué usas torch.no_grad() en la validación?',
    answerStudent: 'Porque en validación solo estoy midiendo el desempeño, no aprendiendo. Al desactivar el grafo de gradientes, la ejecución es mucho más rápida y consume la mitad de memoria VRAM.',
    keyIdea: 'Validar es solo medir; no requiere construir grafos de autograd.',
    visualType: 'net',
  },
  {
    id: 5,
    step: '4',
    question: '¿Por qué multiplicas la pérdida por el tamaño del batch al acumular?',
    answerStudent: 'Porque la función criterion devuelve el promedio del batch, pero el último batch tiene 26 imágenes en vez de 32. Si promediara directamente los promedios, las últimas 26 fotos tendrían un peso desproporcionado. Multiplicando por batch.size(0) cada imagen cuenta exactamente lo mismo.',
    keyIdea: 'El último batch es más pequeño (26 fotos vs 32).',
    visualType: 'dataloader',
  },
  {
    id: 6,
    step: '4',
    question: '¿Por qué se entrenan 8 o 10 épocas?',
    answerStudent: 'Cumple el mínimo exigido por la pauta. Al tener el backbone congelado y entrenar solo 1,539 parámetros con Adam, la red converge rápidamente entre las épocas 4 y 6 sin necesidad de cientos de épocas.',
    keyIdea: '8 épocas cumplen la pauta y alcanzan la convergencia óptima con menor valid_loss.',
    visualType: 'net',
  },
  {
    id: 7,
    step: '4',
    question: '¿Cómo detectas sobreajuste (overfitting) en tus curvas?',
    answerStudent: 'Miro las dos curvas juntas: si la pérdida de entrenamiento sigue bajando pero la de validación empieza a subir sostenidamente durante 3 épocas seguidas, el modelo está memorizando. Si ambas bajan y se mantienen parejas, no hay sobreajuste.',
    keyIdea: 'Train loss baja mientras val loss sube = sobreajuste.',
    visualType: 'net',
  },
  {
    id: 8,
    step: '4',
    question: '¿Por qué el notebook guarda el mejor modelo por valid_loss y no por accuracy?',
    answerStudent: 'Porque valid_loss es un valor continuo suave que mide la calibración de las probabilidades de error. El accuracy puede estancarse o engañar por el desbalance de clases 70/20/10.',
    keyIdea: 'La pérdida de validación mide de forma continua la calidad de generalización.',
    visualType: 'net',
  },
  {
    id: 9,
    step: '4',
    question: '¿Por qué no usas el conjunto de Test para elegir la mejor época?',
    answerStudent: 'Porque el test contiene fotos que el modelo jamás debe haber visto para ninguna decisión. Si eligiera la mejor época mirando el test, cometería Data Leakage y los resultados finales serían falsamente optimistas.',
    keyIdea: 'El test set se usa una sola vez al final absoluto.',
    visualType: 'dataloader',
  },
  {
    id: 10,
    step: '4',
    question: '¿Cómo aseguras el uso de GPU en Colab?',
    answerStudent: 'Uso torch.device("cuda" if torch.cuda.is_available() else "cpu") y mando tanto el modelo como cada batch a la GPU con .to(device). Si uno queda en CPU y otro en GPU, PyTorch lanza un error de incompatibilidad de tensores.',
    keyIdea: 'Modelo y datos deben residir en el mismo hardware.',
    visualType: 'net',
  },
  {
    id: 11,
    step: '5',
    question: '¿Qué diferencia hay entre Precision y Recall en este puerto?',
    answerStudent: 'El Recall de daño crítico me dice: de todos los contenedores rotos reales, ¿cuántos descubrí? Si es bajo, cargamos techos aplastados al buque. La Precision me dice: de los que rechacé, ¿cuántos realmente estaban dañados? Si es baja, retenemos contenedores sanos por falsas alarmas.',
    keyIdea: 'Recall = seguridad de vida; Precision = eficiencia logística sin falsas alarmas.',
    visualType: 'matrix',
  },
  {
    id: 12,
    step: '5',
    question: '¿Cuál es la celda más grave de la matriz de confusión y por qué?',
    answerStudent: 'La celda [Real=2, Pred=0] (Falso Negativo Crítico): un contenedor con daño estructural clasificado como techo intacto. Y casi igual de grave es clasificarlo como óxido leve [Real=2, Pred=1], porque los contenedores con óxido también se autorizan para viajar. En ambos casos el contenedor comprometido sube al buque bajo 150 toneladas de carga.',
    keyIdea: 'Los contenedores con óxido también se cargan: clasificar daño como óxido es fatal.',
    visualType: 'matrix',
  },
  {
    id: 13,
    step: '5',
    question: '¿Qué es el promedio Macro y qué es el promedio Ponderado?',
    answerStudent: 'El promedio Macro saca la media aritmética de las 3 clases como si todas fueran igual de importantes (un tercio cada una), protegiendo a la clase minoritaria de daño crítico. El promedio ponderado pondera por el número de imágenes, por lo que queda dominado por la clase intacta (70%) y se parece al accuracy.',
    keyIdea: 'Macro trata igual a las 3 clases; ponderado esconde la falla en la clase rara.',
    visualType: 'matrix',
  },
  {
    id: 14,
    step: '5',
    question: '¿Para qué sirve la comparación con el modelo que siempre dice "Intacto"?',
    answerStudent: 'Para demostrar científicamente que el Accuracy por sí solo engaña. Un modelo flojo que siempre diga "Intacto" ya obtiene casi 70% de exactitud, pero su recall de daño crítico es 0.0% y todos los contenedores rotos van al mar. Mi modelo debe superarlo en Macro-F1 y en Recall de daño.',
    keyIdea: 'Es la línea base trivial a superar obligatoriamente.',
    visualType: 'matrix',
  },
  {
    id: 15,
    step: '5',
    question: '¿Por qué conviene priorizar el Recall de la clase 2 sobre su Precision?',
    answerStudent: 'Por la asimetría extrema de costos: rechazar por error un contenedor sano cuesta $50 dólares en una inspección manual de 15 minutos en muelle; dejar pasar un contenedor roto puede significar el colapso de una columna entera en altamar y pérdidas millonarias.',
    keyIdea: 'Asimetría de costos operacionales marítimos.',
    visualType: 'matrix',
  },
  {
    id: 16,
    step: '5',
    question: '¿Qué significa una celda fuera de la diagonal en la matriz?',
    answerStudent: 'Cualquier celda fuera de la diagonal representa un error de clasificación. Las filas son la condición real y las columnas la predicción de la IA. La diagonal principal son los aciertos.',
    keyIdea: 'Diagonal = aciertos; fuera de la diagonal = confusiones operacionales.',
    visualType: 'matrix',
  },
  {
    id: 17,
    step: '5',
    question: '¿Son confiables estas métricas para operar en un buque mercante real?',
    answerStudent: 'Para el negocio real, todavía no. El experimento valida que el pipeline técnico en PyTorch funciona de principio a fin. Como las imágenes son sintéticas procedurales, no se pueden extrapolar directamente a contenedores reales con grafitis, nieve o suciedad portuaria hasta recopilar fotos reales de drones.',
    keyIdea: 'Valida el flujo técnico de ingeniería, no el desempeño de negocio en producción.',
    visualType: 'net',
  },
  {
    id: 18,
    step: '4',
    question: '¿Qué significa congelar una capa con requires_grad = False?',
    answerStudent: 'Significa que las fotos siguen pasando por esa capa durante el forward pass y utilizando sus filtros entrenados en ImageNet, pero PyTorch no calcula derivadas ni actualiza sus pesos. Congelar NO significa omitir la capa.',
    keyIdea: 'La capa se ejecuta en el forward, pero sus parámetros se mantienen fijos.',
    visualType: 'freeze',
  },
  {
    id: 19,
    step: '4',
    question: '¿Qué diferencia hay entre backward() y optimizer.step()?',
    answerStudent: 'backward() calcula los gradientes del error respecto a cada peso usando la regla de la cadena (solo llena el campo .grad). optimizer.step() lee esos gradientes y altera los valores numéricos de los pesos con la fórmula de Adam. Son dos etapas completamente distintas.',
    keyIdea: 'backward calcula derivadas; optimizer.step actualiza pesos.',
    visualType: 'freeze',
  },
  {
    id: 20,
    step: '4',
    question: '¿Por qué CrossEntropyLoss recibe logits y no probabilidades?',
    answerStudent: 'Porque PyTorch implementa internamente la combinación matemática de LogSoftmax y NLLLoss con optimizaciones de coma flotante. Si aplicaras softmax antes, se perdería precisión numérica y ocurrirían desbordamientos (underflow/overflow).',
    keyIdea: 'CrossEntropyLoss espera logits crudos para máxima estabilidad numérica.',
    visualType: 'softmax',
  },
  {
    id: 21,
    step: '4',
    question: '¿Qué hace el DataLoader?',
    answerStudent: 'El Dataset almacena las imágenes en memoria o disco. El DataLoader organiza el flujo: toma las imágenes, las agrupa en lotes de 32, aplica el shuffle aleatorio en train y utiliza procesos secundarios (num_workers) para que la GPU no se detenga.',
    keyIdea: 'Dataset contiene; DataLoader organiza y entrega en batches.',
    visualType: 'dataloader',
  },
  {
    id: 22,
    step: '4',
    question: '¿Qué busca el Data Augmentation en entrenamiento?',
    answerStudent: 'Crear variaciones realistas de las imágenes (rotación ±10°, giros horizontales) para que la red aprenda características geométricas robustas y no memorice una orientación fija de la cámara del dron.',
    keyIdea: 'Variar la apariencia sin cambiar la etiqueta del contenedor.',
    visualType: 'dataloader',
  },
  {
    id: 23,
    step: '5',
    question: '¿Qué muestra Grad-CAM y para qué sirve en la auditoría portuaria?',
    answerStudent: 'Muestra un mapa de calor que resalta qué regiones de la imagen empujaron con más fuerza hacia la decisión. Sirve para certificar que la IA miró la abolladura o el óxido y no se distrajo con atajos tramposos como las olas del mar o el cemento del muelle.',
    keyIdea: 'Mapa de atención visual para descartar Shortcut Learning.',
    visualType: 'gradcam',
  },
];

export const ExamQuestionsSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | '4' | '5' | 'todo'>('all');
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ac_exam_done_v4');
      if (saved) setDoneMap(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleDone = (id: number) => {
    const updated = { ...doneMap, [id]: !doneMap[id] };
    setDoneMap(updated);
    try {
      localStorage.setItem('ac_exam_done_v4', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRandomQuestion = () => {
    const pool = EXAM_QUESTIONS.filter((q) => (filter === 'todo' ? !doneMap[q.id] : true));
    const list = pool.length ? pool : EXAM_QUESTIONS;
    const randomQ = list[Math.floor(Math.random() * list.length)];
    setOpenQuestionId(randomQ.id);
    const el = document.getElementById(`q_item_${randomQ.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredQuestions = EXAM_QUESTIONS.filter((q) => {
    if (filter === 'all') return true;
    if (filter === '4') return q.step === '4';
    if (filter === '5') return q.step === '5';
    if (filter === 'todo') return !doneMap[q.id];
    return true;
  });

  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const progressPercent = Math.round((doneCount / EXAM_QUESTIONS.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>DEFENSA TÉCNICA · 23 PREGUNTAS CLAVE DEL PROFESOR / EVALUADOR</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Simulador de Interrogación y Preguntas de Examen
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Respuestas formuladas exactamente como debe defenderlas un estudiante ante la comisión evaluadora.
            </p>
          </div>

          <button
            onClick={handleRandomQuestion}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-700/60 bg-cyan-950/40 hover:bg-cyan-900/50 text-xs font-semibold text-cyan-300 transition-colors shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Pregunta al Azar</span>
          </button>
        </div>

        {/* Filter and Progress Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas (23)
            </button>
            <button
              onClick={() => setFilter('4')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filter === '4'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paso 4: Entrenamiento
            </button>
            <button
              onClick={() => setFilter('5')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filter === '5'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paso 5: Métricas & Matriz
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filter === 'todo'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Por Repasar ({EXAM_QUESTIONS.length - doneCount})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-slate-300 text-xs whitespace-nowrap">
              {doneCount}/{EXAM_QUESTIONS.length} ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isOpen = openQuestionId === q.id;
          const isDone = !!doneMap[q.id];

          return (
            <div
              key={q.id}
              id={`q_item_${q.id}`}
              className={`rounded-xl border transition-all overflow-hidden ${
                isDone
                  ? 'border-emerald-800/80 bg-slate-900/60'
                  : isOpen
                  ? 'border-cyan-500/60 bg-slate-900 shadow-md ring-1 ring-cyan-500/40'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      q.step === '4'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    Paso {q.step}
                  </span>
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDone && (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 hidden sm:inline-flex">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dominada
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Collapsible Answer */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 animate-fade-in text-xs">
                  {/* Visual Illustration Badge */}
                  {q.visualType === 'matrix' && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] flex items-center gap-4">
                      <span className="text-cyan-400 font-bold">Esquema Matriz:</span>
                      <div className="grid grid-cols-2 gap-1 text-center">
                        <span className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400">TP (Acierto)</span>
                        <span className="p-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold">FN (Crítico)</span>
                        <span className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400">FP (Falsa alarma)</span>
                        <span className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400">TN (Sano)</span>
                      </div>
                    </div>
                  )}

                  {q.visualType === 'freeze' && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Base 🔒 Congelada</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Capa FC ✏️ Entrenable</span>
                      <span className="text-slate-500">←</span>
                      <span className="text-red-400">loss.backward()</span>
                    </div>
                  )}

                  {/* Student Answer */}
                  <div className="space-y-1">
                    <span className="font-mono text-cyan-400 text-[10px] block uppercase font-bold">
                      Respuesta del Estudiante en la Presentación:
                    </span>
                    <p className="text-slate-200 leading-relaxed text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                      "{q.answerStudent}"
                    </p>
                  </div>

                  {/* Key Takeaway and Mastery Toggle Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                      <span>💡 Idea clave:</span>
                      <span className="text-slate-300 font-normal">{q.keyIdea}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDone(q.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Quitar de Dominadas' : 'Marcar como Dominada'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
