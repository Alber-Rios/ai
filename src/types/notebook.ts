export type ContainerClassId = 0 | 1 | 2;

export interface ContainerClassInfo {
  id: ContainerClassId;
  name: string;
  shortName: string;
  badge: string;
  decision: string;
  description: string;
  color: string;
  proportion: number; // e.g. 70, 20, 10
  riskLevel: 'bajo' | 'medio' | 'critico';
}

export interface CodeBlockDetail {
  title: string;
  code: string;
  summary: string;
  lineExplanations: {
    lines: string;
    explanation: string;
    concept: string;
  }[];
  keyTakeaway: string;
  rubricCriterion?: {
    code: string;
    description: string;
  };
}

export interface PerasYManzanasDetail {
  tituloSimple: string;
  resumenSencillo: string;
  analogiaCotidiana: string;
  porQueSeHizoAsi: string;
  quePasaSiNoSeHace: string;
  puntosClave: {
    queEs: string;
    porQue: string;
    ejemplo: string;
  }[];
}

export interface PipelineStage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'datos' | 'modelo' | 'entrenamiento' | 'evaluacion' | 'explicabilidad';
  icon: string;
  summary: string;
  technicalDetails: string;
  codeBlocks: CodeBlockDetail[];
  interactiveMode: 'generator' | 'augmentation' | 'model' | 'training' | 'matrix' | 'gradcam' | 'audit';
  defaultClassView: ContainerClassId;
  rubricPoints: string[];
  perasYManzanas: PerasYManzanasDetail;
}

export interface ConfusionMatrixCell {
  real: ContainerClassId;
  pred: ContainerClassId;
  count: number;
  percentage: number;
  status: 'acierto' | 'falsa_alarma' | 'grave' | 'critico';
  title: string;
  operationalImpact: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rubricRef: string;
}
