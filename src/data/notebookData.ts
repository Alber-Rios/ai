import { ContainerClassInfo, PipelineStage, ConfusionMatrixCell, QuizQuestion } from '../types/notebook';

export const CONTAINER_CLASSES: ContainerClassInfo[] = [
  {
    id: 0,
    name: 'Techo intacto',
    shortName: 'Intacto',
    badge: 'Apto para carga',
    decision: 'Apto para estiba en buque',
    description: 'Estructura corrugada sana con pintura uniforme. Presenta solo desgaste o suciedad superficial permisible.',
    color: '#0284c7', // Sky/Cyan
    proportion: 70,
    riskLevel: 'bajo',
  },
  {
    id: 1,
    name: 'Óxido / corrosión leve',
    shortName: 'Óxido leve',
    badge: 'Mantenimiento futuro',
    decision: 'Apto temporalmente; programar mantenimiento en patio',
    description: 'Manchas de óxido naranjo-café y picaduras superficiales sin comprometer la resistencia mecánica.',
    color: '#d97706', // Amber
    proportion: 20,
    riskLevel: 'medio',
  },
  {
    id: 2,
    name: 'Abolladura / daño estructural crítico',
    shortName: 'Daño crítico',
    badge: '⛔ Rechazado para carga',
    decision: 'RECHAZADO: Riesgo de colapso al apilar otros contenedores',
    description: 'Hundimiento profundo o deformación de costillas de acero. Incapaz de soportar las 30+ toneladas de carga superior.',
    color: '#dc2626', // Red
    proportion: 10,
    riskLevel: 'critico',
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'setup',
    number: '00',
    title: 'Configuración y Reproducibilidad',
    subtitle: 'Fijación de semillas y hardware T4 / CPU',
    category: 'datos',
    icon: 'Terminal',
    summary: 'Establece la reproducibilidad estricta del experimento en PyTorch, NumPy y CUDA, junto con las constantes de resolución e hiperparámetros.',
    technicalDetails: `Para garantizar que cualquier evaluador obtenga exactamente los mismos resultados numéricos (partición de datos, inicialización de pesos de la cabeza lineal, orden de los batches en DataLoader), se configuran todas las fuentes de pseudo-aleatoriedad del sistema. Además se asegura la ejecución determinista en cuDNN.`,
    defaultClassView: 0,
    interactiveMode: 'generator',
    rubricPoints: ['Semilla global fija (42)', 'Configuración de dispositivo CUDA/CPU', 'Parámetros TAM=224, BATCH=32, EPOCAS=10'],
    perasYManzanas: {
      tituloSimple: 'Grabar los dados para que nunca salgan números distintos',
      resumenSencillo: 'Fija las reglas del azar para que cada vez que aprietes "Play", el programa haga exactamente lo mismo y el profesor obtenga la misma nota que tú.',
      analogiaCotidiana: 'Es como barajar un mazo de cartas con una máquina programada: si siempre hace los mismos 3 cortes, a cada jugador le tocarán exactamente las mismas cartas en cada partida.',
      porQueSeHizoAsi: 'En ciencia no puedes presentar un trabajo donde hoy sacas un 97% y mañana un 85% solo porque la computadora tiró los dados de manera distinta.',
      quePasaSiNoSeHace: 'Nadie podría comprobar tus resultados; el examen daría números diferentes cada vez que se ejecute.',
      puntosClave: [
        {
          queEs: 'Semilla 42 (Seed 42)',
          porQue: 'Es el punto de partida fijo de la ruleta matemática.',
          ejemplo: 'Cualquier número entero sirve (7, 42 o 99); el 42 se usa por tradición computacional.',
        },
        {
          queEs: 'Resolución TAM = 224',
          porQue: 'Es el tamaño exacto de foto pasaporte que el cerebro de ResNet sabe leer sin deformarse.',
          ejemplo: 'Si metes una foto panorámica gigante en el recuadro de la cédula, la cara queda aplastada.',
        },
        {
          queEs: 'Lote de 32 (Batch 32)',
          porQue: 'Cocinar en bandejas de 32 platos para que el horno de la tarjeta de video no se queme ni quede ocioso.',
          ejemplo: 'Cocinar de a 1 es lentísimo; cocinar para 1.000 a la vez revienta la memoria de la tarjeta.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Fijación de Semillas y Hardware',
        code: `def fijar_semillas(seed=SEED):
    """Reproducibilidad: fija todas las fuentes de aleatoriedad."""
    os.environ['PYTHONHASHSEED'] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

fijar_semillas(SEED)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')`,
        summary: 'Bloquea el no-determinismo a nivel de Python hash, generadores estándar, NumPy, PyTorch CPU y PyTorch CUDA.',
        keyTakeaway: 'cudnn.deterministic=True evita que los algoritmos de convolución de NVIDIA elijan variantes no reproducibles según micro-benchmarks.',
        lineExplanations: [
          {
            lines: 'os.environ["PYTHONHASHSEED"] = str(seed)',
            explanation: 'Fija el hash seed para evitar orden aleatorio en diccionarios y conjuntos de Python.',
            concept: 'Python Runtime',
          },
          {
            lines: 'torch.manual_seed(seed) / torch.cuda.manual_seed_all(seed)',
            explanation: 'Inicializa los generadores de números pseudoaleatorios de PyTorch tanto para tensores en CPU como en todas las GPUs detectadas.',
            concept: 'PyTorch Randomness',
          },
          {
            lines: 'torch.backends.cudnn.deterministic = True',
            explanation: 'Fuerza a cuDNN a usar algoritmos deterministas. Se apaga benchmark para que no cambie el kernel de convolución según la carga.',
            concept: 'cuDNN Engine',
          },
        ],
      },
    ],
  },
  {
    id: 'generator',
    number: '01',
    title: 'Generación Sintética Procedural',
    subtitle: 'Simulación física de techos en tensores [3, 224, 224]',
    category: 'datos',
    icon: 'Layers',
    summary: 'Construye proceduralmente 1,500 imágenes como tensores RGB de 224×224 píxeles: fondo oceánico, costillas de acero corrugado, manchas de óxido y abolladuras 3D.',
    technicalDetails: `Como la naviera aún no dispone de un banco de 10,000 fotografías reales de drones, se programó un motor procedural en PyTorch que modela físicamente la óptica de la escena:
1. Malla 2D (XX, YY) mediante torch.meshgrid para cálculo vectorial sin bucles for lentos.
2. Acero corrugado mediante onda sinusoidal periódica: 0.5 + 0.5 * sin(2*pi * XX / periodo).
3. Deformación 2D gaussiana para abolladuras (Clase 2): sumatoria de campanas gaussianas que distorsionan la fase de la onda de corrugación.
4. Sombreado direccional físico con torch.gradient(deform): calcula vectores normales y gradientes espaciales de luz (gx, gy) para proyectar sombras realistas.
5. Manchas de óxido (Clase 1): ruido de baja frecuencia bicúbico + función sigmoide + umbralización para picaduras.
6. Fondo de mar con oleaje bicúbico y muelle opcional: esencial para verificar si el modelo aprende atajos espaciales.`,
    defaultClassView: 2,
    interactiveMode: 'generator',
    rubricPoints: [
      'Indicador 1.2: Dimensiones [batch, 3, 224, 224] y formato uint8',
      'Desbalance exacto 70% / 20% / 10% (1050 / 300 / 150)',
      'Modelado físico de luz con torch.gradient',
    ],
    perasYManzanas: {
      tituloSimple: 'Dibujar fotos falsas de techos con matemáticas (porque aún no hay fotos reales)',
      resumenSencillo: 'Como la empresa aún no entrega fotos de drones reales, inventamos un simulador que dibuja 1,500 techos con olas de mar, costillas de metal, manchas de óxido y abolladuras 3D.',
      analogiaCotidiana: 'Es como el simulador de vuelo donde practican los pilotos: antes de subirse a un avión de pasajeros real, vuelan cientos de horas en un videojuego hiperrealista.',
      porQueSeHizoAsi: 'Para poder avanzar de inmediato sin esperar meses de trámites en el puerto, sabiendo exactamente qué defecto tiene cada foto.',
      quePasaSiNoSeHace: 'El proyecto se paraliza por falta de datos y no se puede entrenar ninguna red neuronal.',
      puntosClave: [
        {
          queEs: 'Costillas corrugadas (seno periódico)',
          porQue: 'El techo de un contenedor no es plano; tiene ondas de acero para soportar peso.',
          ejemplo: 'Una fórmula matemática ondulada simula las franjas de acero corrugado.',
        },
        {
          queEs: 'Abolladuras (Campanas de Gauss 2D)',
          porQue: 'Un golpe genera un hundimiento profundo en el centro que se va suavizando hacia los bordes.',
          ejemplo: 'Es como presionar una pelota de plasticina con el dedo pulgar.',
        },
        {
          queEs: 'Fondo de mar y muelle',
          porQue: 'Para comprobar si la IA mira el contenedor o si hace trampa mirando el agua.',
          ejemplo: 'Si el modelo mira el oleaje para decidir, cuando cambie de puerto se equivocará.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Generador de Techos y Deformaciones',
        code: `def generar_techo(clase, g):
    # Geometría del contenedor en coordenadas de píxel
    y0, y1 = rint(g, 40, 62), TAM - rint(g, 40, 62)
    x0, x1 = rint(g, 14, 26), TAM - rint(g, 14, 26)
    mascara = (XX >= x0) & (XX < x1) & (YY >= y0) & (YY < y1)

    color = COLORES_CONTENEDOR[rint(g, 0, len(COLORES_CONTENEDOR))] + 0.03 * torch.randn(3, generator=g)
    periodo = 8 + 3 * torch.rand(1, generator=g).item()

    # --- Abolladuras (Clase 2): hundimientos gaussianos 2D ---
    deform = torch.zeros(TAM, TAM)
    if clase == 2:
        for _ in range(rint(g, 1, 4)):
            cy, cx = rint(g, y0 + 15, y1 - 15), rint(g, x0 + 25, x1 - 25)
            sy = 12 + 14 * torch.rand(1, generator=g).item()
            sx = 12 + 18 * torch.rand(1, generator=g).item()
            amp = 0.8 + 0.4 * torch.rand(1, generator=g).item()
            deform += amp * torch.exp(-((YY - cy) ** 2 / (2 * sy ** 2) + (XX - cx) ** 2 / (2 * sx ** 2)))

    # Acero corrugado: costillas distorsionadas por la abolladura
    costilla = 0.5 + 0.5 * torch.sin(2 * math.pi * (XX + 22 * deform) / periodo)
    techo = color.view(3, 1, 1) * (0.80 + 0.30 * costilla).unsqueeze(0)

    if clase == 2:
        gy, gx = torch.gradient(deform)
        sombreado = 1 + 9.0 * (gx + gy) - 0.25 * deform + 0.12 * ruido_suave(g, 60) * deform.clamp(0, 1)
        techo = techo * sombreado.unsqueeze(0)`,
        summary: 'Construye la imagen proceduralmente deformando la fase de la onda periódica y modulando el canal de luz según el gradiente espacial del hundimiento.',
        keyTakeaway: 'XX + 22 * deform distorsiona directamente la cuadrícula corrugada, logrando que las líneas rectas de acero se arruguen de forma realista.',
        lineExplanations: [
          {
            lines: 'deform += amp * torch.exp(-((YY - cy)**2 / (2*sy**2) + (XX - cx)**2 / (2*sx**2)))',
            explanation: 'Crea una campana gaussiana 2D elíptica centrada en (cx, cy) con semiejes (sx, sy). Representa la profundidad del golpe en el techo.',
            concept: 'Deformación Gaussiana 2D',
          },
          {
            lines: 'torch.sin(2 * math.pi * (XX + 22 * deform) / periodo)',
            explanation: 'Modulación de fase: el término "+ 22 * deform" desplaza la coordenada X de la costilla en función de la profundidad, doblando el acero corrugado.',
            concept: 'Modulación de Fase de Onda',
          },
          {
            lines: 'gy, gx = torch.gradient(deform)',
            explanation: 'Aproxima las derivadas parciales d(deform)/dy y d(deform)/dx con diferencias finitas centrales. Simula el vector normal de la superficie para renderizar sombras de relieve.',
            concept: 'Cálculo de Sombreado Difuso',
          },
        ],
      },
    ],
  },
  {
    id: 'augmentation',
    number: '02',
    title: 'Pipeline, Augmentation y Desbalance',
    subtitle: 'Partición 70/15/15, torchvision v2 y Pesos Inversos',
    category: 'datos',
    icon: 'Sliders',
    summary: 'Aplica transformaciones estocásticas invariantes (flips, rotaciones ±15°, jitter de color) exclusivamente a entrenamiento y calcula la ponderación w_c = N / (K · n_c).',
    technicalDetails: `El diseño del preprocesamiento resuelve dos desafíos críticos:
1. Contaminación de Datos (Data Leakage): El Data Augmentation solo se aplica a train_ds mediante una clase wrapper 'ConTransform'. Validación y Prueba NUNCA se perturban con rotaciones ni flips; solo se normalizan a la distribución estándar de ImageNet (media [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225]).
2. Desbalance de Clases (70% intacto, 20% óxido, 10% daño): Un modelo trivial prediciendo siempre "intacto" obtendría 70% de exactitud con 0% de detección en fallas críticas. Para evitar esto, se calculan pesos inversamente proporcionales: la clase crítica pesa ~7 veces más en la función de pérdida.`,
    defaultClassView: 1,
    interactiveMode: 'augmentation',
    rubricPoints: [
      'Indicador 1.1: random_split 70% (1050), 15% (225), 15% (225)',
      'Indicador 1.3: Data Augmentation con torchvision.transforms.v2',
      'Indicador 1.4: Manejo de desbalance con pesos de clase analíticos',
    ],
    perasYManzanas: {
      tituloSimple: 'Girar las fotos y cobrar multas 7 veces más caras al daño crítico',
      resumenSencillo: 'Volteamos las fotos como si el dron llegara desde otro ángulo y le decimos a la IA: casi todos los techos vienen sanos (70%), pero si dejas pasar uno roto (10%), te cobraré una multa gigante.',
      analogiaCotidiana: 'Es como entrenar a un perro policía guardián: le cambias el camino todos los días para que no se acostumbre a una sola rutina, y si descubre un peligro le das el premio más grande.',
      porQueSeHizoAsi: 'Si la IA fuera floja y siempre dijera "techo sano", sacaría un 70% de nota sin descubrir ningún peligro.',
      quePasaSiNoSeHace: 'La red ignoraría por completo los contenedores con daño estructural porque son muy poquitos (solo el 10%).',
      puntosClave: [
        {
          queEs: 'Volteos y rotaciones (Data Augmentation)',
          porQue: 'Un dron puede sobrevolar el contenedor desde el norte o el sur; el techo roto sigue estando roto.',
          ejemplo: 'Girar la foto 15 grados o darla vuelta como espejo no cambia el peligro del contenedor.',
        },
        {
          queEs: 'Pesos de clase en la pérdida (w_c)',
          porQue: 'Equivocarse en un techo roto cuesta una multa 7 veces mayor en el entrenamiento.',
          ejemplo: 'Obliga a los gradientes a esforzarse por aprender las características de la clase minoritaria.',
        },
        {
          queEs: 'Separación 70% entrenamiento / 15% validación / 15% prueba',
          porQue: 'Nunca puedes evaluar a un estudiante con las mismas preguntas de la guía que practicó en clases.',
          ejemplo: '225 fotos quedan bajo llave y la red nunca las ve hasta el día del examen final.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Pipeline de Aumento y Normalización',
        code: `MEDIA = [0.485, 0.456, 0.406]     # Estadísticas oficiales de ImageNet
STD   = [0.229, 0.224, 0.225]

transform_train = v2.Compose([
    v2.RandomHorizontalFlip(p=0.5),
    v2.RandomVerticalFlip(p=0.5),
    v2.RandomRotation(degrees=15),
    v2.ColorJitter(brightness=0.3, contrast=0.2), # Simula condiciones de sol/nubes
    v2.ToDtype(torch.float32, scale=True),         # uint8 [0,255] → float [0,1]
    v2.Normalize(mean=MEDIA, std=STD),
])

transform_eval = v2.Compose([
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=MEDIA, std=STD),
])

# Cálculo de pesos para contrarrestar el desbalance 70/20/10
y_train = y[sub_train.indices]
conteo_train = torch.bincount(y_train, minlength=3).float()
pesos_clase = (len(y_train) / (3.0 * conteo_train)).to(device) # w_c = N / (K * n_c)`,
        summary: 'Prepara las imágenes para que coincidan con la distribución estadística con la que ResNet18 fue entrenada y asigna mayor gradiente a los casos de daño estructural.',
        keyTakeaway: 'Normalizar con las medias de ImageNet no es opcional: si se omitiera, los filtros convolucionales del backbone preentrenado reaccionarían a rangos numéricos incorrectos.',
        lineExplanations: [
          {
            lines: 'v2.RandomHorizontalFlip(p=0.5) / v2.RandomVerticalFlip(p=0.5)',
            explanation: 'Refleja la imagen. Válido porque un contenedor visto desde un dron puede estar orientado en cualquier cuadrante sin alterar su gravedad estructural.',
            concept: 'Invarianza Geométrica',
          },
          {
            lines: 'v2.ColorJitter(brightness=0.3, contrast=0.2)',
            explanation: 'Altera el brillo y contraste en cada pasada, simulando cambios de hora del día, luz solar cenital o días nublados en el puerto.',
            concept: 'Robustez Fotométrica',
          },
          {
            lines: 'pesos_clase = len(y_train) / (3.0 * conteo_train)',
            explanation: 'Fórmula balanceada: N / (3 * n_c). Para la clase 2 (daño crítico), al ser solo ~10%, el peso resultante es ~7.0, multiplicando el gradiente en retropropagación.',
            concept: 'Ponderación Inversa de Clases',
          },
        ],
      },
    ],
  },
  {
    id: 'model',
    number: '03',
    title: 'Arquitectura ResNet-18 y Transfer Learning',
    subtitle: 'Backbone congelado y nueva cabeza de clasificación',
    category: 'modelo',
    icon: 'Cpu',
    summary: 'Carga ResNet-18 con pesos de ImageNet, congela sus 11.2 millones de parámetros (requires_grad = False) y reemplaza la capa final por un Dropout(0.3) + Linear(512, 3).',
    technicalDetails: `¿Por qué ResNet-18 y Feature Extraction?
1. Estabilidad de Gradiente: Los bloques residuales con atajos de identidad y = F(x) + x evitan el desvanecimiento de gradiente característico de redes convolucionales planas.
2. Prevención de Sobreajuste (Overfitting): Contamos con 1,050 imágenes de entrenamiento. Entrenar 11 millones de parámetros en tan pocos datos generaría memorización inmediata. Al congelar el backbone, solo se entrenan 1,539 parámetros en la capa 'fc' (512 * 3 pesos + 3 sesgos).
3. Transferencia Visual: Los filtros iniciales de ImageNet (Gabor, bordes, gradientes, texturas repetitivas) son ideales para detectar las ondas del corrugado y las manchas irregulares de óxido.
4. Preservación de Estadísticas: Se mantiene BatchNorm en modo eval() durante el entrenamiento para que la media y varianza móviles de ImageNet no se corrompan con minibatches pequeños.`,
    defaultClassView: 0,
    interactiveMode: 'model',
    rubricPoints: [
      'Indicador 2.1: Arquitectura preentrenada coherente (ResNet-18)',
      'Indicador 2.2: Sustitución de modelo.fc por cabeza de 3 salidas',
      'Indicadores 2.3 / 2.4: Feature Extraction con requires_grad=False y justificación',
    ],
    perasYManzanas: {
      tituloSimple: 'Pedir prestado el cerebro de un fotógrafo experto y ponerle candado (ResNet-18)',
      resumenSencillo: 'En vez de inventar una IA desde cero que no sabe ni qué es una línea, usamos una red que ya miró un millón de fotos en internet. Le ponemos candado a sus 11 millones de tornillos y solo le enseñamos los 3 tipos de techos en la puerta de salida.',
      analogiaCotidiana: 'Es como contratar a un chef profesional premiado para que arme sándwiches: no tienes que enseñarle a prender el horno ni a cortar verduras con cuchillo; solo le dices qué ingredientes lleva el menú.',
      porQueSeHizoAsi: 'Solo tenemos 1,050 fotos para entrenar. Entrenar 11 millones de tornillos con tan poquitas fotos haría que la IA memorice todo de memoria sin entender nada (sobreajuste destructivo).',
      quePasaSiNoSeHace: 'Si entrenas toda la red desde cero, necesitarías 200,000 fotos reales y semanas de computación en supercomputadoras.',
      puntosClave: [
        {
          queEs: 'Congelamiento (requires_grad = False)',
          porQue: 'Pone un candado al 99.98% del cerebro preentrenado para que no se arruine.',
          ejemplo: 'Solo se entrenan 1,539 tornillos nuevos en la última capa lineal.',
        },
        {
          queEs: 'La capa final lineal (fc)',
          porQue: 'Es el inspector sentado en la puerta de salida que emite los 3 puntajes finales.',
          ejemplo: 'Recibe 512 pistas visuales y pone el sello: Apto, Mantenimiento o Rechazado.',
        },
        {
          queEs: 'Dropout (0.3)',
          porQue: 'Apaga al azar el 30% de las pistas en cada pasada para que el inspector no dependa de una sola señal.',
          ejemplo: 'Como entrenar a un equipo de fútbol sin su jugador estrella para que aprendan a jugar en equipo.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Definición de ResNet-18 con Congelamiento',
        code: `def crear_modelo(n_clases=3):
    # 1) Descarga arquitectura con pesos preentrenados oficiales
    modelo = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # 2) Congelar todo el backbone convolucional
    for p in modelo.parameters():
        p.requires_grad = False

    # 3) Reemplazar la capa fully-connected original (1000 clases) por 3 clases
    n_features = modelo.fc.in_features # 512 neuronas de salida del pooling promedio
    modelo.fc = nn.Sequential(
        nn.Dropout(0.3),                 # Regularización estocástica contra sobreajuste
        nn.Linear(n_features, n_clases)  # Capa densa: 512 → 3 logits
    )
    return modelo

modelo = crear_modelo(3).to(device)`,
        summary: 'Adapta la red neuronal residual de 1000 categorías biológicas a las 3 decisiones operativas del puerto marítimo.',
        keyTakeaway: 'Solo el 0.014% de los parámetros totales de la red se optimizan, acelerando el cómputo y evitando el sobreajuste.',
        lineExplanations: [
          {
            lines: 'for p in modelo.parameters(): p.requires_grad = False',
            explanation: 'Desconecta el cálculo de gradientes en el autograd de PyTorch para todas las convoluciones y normalizaciones por lotes.',
            concept: 'Congelamiento de Parámetros',
          },
          {
            lines: 'nn.Dropout(0.3)',
            explanation: 'Durante entrenamiento apaga aleatoriamente el 30% de las 512 características visuales, forzando a la capa densa a no depender de una sola señal visual.',
            concept: 'Dropout Regularizer',
          },
          {
            lines: 'nn.Linear(512, 3)',
            explanation: 'Transformación afín y = xW^T + b que proyecta el vector latente de 512 dimensiones en los 3 logits sin normalizar correspondientes a cada clase.',
            concept: 'Proyección Multiclase',
          },
        ],
      },
    ],
  },
  {
    id: 'training',
    number: '04',
    title: 'Ciclo de Entrenamiento y Optimización',
    subtitle: 'CrossEntropy ponderada, Adam y Checkpoint de Mejor Época',
    category: 'entrenamiento',
    icon: 'Activity',
    summary: 'Ejecuta el bucle de optimización durante 10 épocas: forward pass → pérdida ponderada → backward → step de Adam, conservando el mejor estado por val_loss.',
    technicalDetails: `El ciclo implementa el estándar riguroso de PyTorch para entrenamiento de redes neuronales:
1. Forward Pass: Las imágenes pasan por el backbone y generan logits en R^3.
2. CrossEntropyLoss con pesos de clase: Combina matemáticamente LogSoftmax y NLLLoss (Negative Log Likelihood). Los errores en techos con daño estructural generan una penalización mucho mayor en la función de costo.
3. optimizador.zero_grad(set_to_none=True): set_to_none=True libera memoria directamente en lugar de escribir ceros en los buffers de gradiente.
4. Retropropagación (loss.backward()): Calcula dLoss/dw solo para los parámetros de la capa fc.
5. Checkpoint por Early Stopping / Menor Val Loss: Se almacena un deepcopy de state_dict() cuando la pérdida de validación mejora, protegiendo al modelo final de épocas con sobreajuste tardío.`,
    defaultClassView: 1,
    interactiveMode: 'training',
    rubricPoints: [
      'Pérdida multiclase CrossEntropyLoss(weight=pesos_clase)',
      'Optimizador Adam(lr=1e-3, weight_decay=1e-4)',
      'Monitoreo conjunto de Train Loss/Acc y Val Loss/Acc',
    ],
    perasYManzanas: {
      tituloSimple: 'El gimnasio de la IA: Mirar, equivocarse y corregir con frenos inteligentes (Adam)',
      resumenSencillo: 'Durante 10 rondas (épocas), la IA mira bandejas de 32 fotos, dice su respuesta, se le corrige con la multa y ajusta sus tornillos con el optimizador Adam. Guardamos la mejor partida antes de que se canse.',
      analogiaCotidiana: 'Es como aprender a andar en bicicleta con un instructor al lado que te avisa cuándo frenar y cuándo pedalear más rápido.',
      porQueSeHizoAsi: 'Adam ajusta la velocidad de aprendizaje de cada tuerca por separado, logrando que en solo 10 vueltas ya reconozca el 96% de los techos.',
      quePasaSiNoSeHace: 'Si usas descenso de gradiente común sin frenos, la red oscilaría caóticamente y tardaría 200 épocas en aprender.',
      puntosClave: [
        {
          queEs: 'Optimizador Adam',
          porQue: 'Acelera en caminos despejados y frena en las curvas difíciles.',
          ejemplo: 'Ajusta cada uno de los 1,539 pesos con su propia velocidad individual.',
        },
        {
          queEs: 'loss.backward() (Retropropagación)',
          porQue: 'Pasa la película en cámara lenta hacia atrás para ver de quién fue la culpa del fallo.',
          ejemplo: 'Le asigna una nota de corrección a cada tornillo que participó en la mala decisión.',
        },
        {
          queEs: 'Guardar partida (deepcopy)',
          porQue: 'Si en la época 6 sacó un 97% y en la época 10 se puso a adivinar mal, nos quedamos con la época 6.',
          ejemplo: 'Guardar partida en un videojuego antes de la pelea difícil.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Bucle de Entrenamiento por Lotes (Epoch Loop)',
        code: `def correr_epoca(m, loader, criterio, optimizador=None):
    entrenando = optimizador is not None
    # Dropout activo en train, pero BatchNorm del backbone congelado en eval()
    m.train() if entrenando else m.eval()
    if entrenando:
        for mod in m.modules():
            if isinstance(mod, nn.BatchNorm2d):
                mod.eval()

    perdida_acum, aciertos, n = 0.0, 0, 0
    with torch.set_grad_enabled(entrenando):
        for xb, yb in loader:
            xb, yb = xb.to(device, non_blocking=True), yb.to(device, non_blocking=True)
            logits = m(xb)                         # 1) Forward pass
            perdida = criterio(logits, yb)         # 2) Cálculo de pérdida ponderada
            if entrenando:
                optimizador.zero_grad(set_to_none=True)
                perdida.backward()                 # 3) Retropropagación de gradientes
                optimizador.step()                 # 4) Actualización de pesos con Adam
            
            perdida_acum += perdida.item() * xb.size(0)
            aciertos += (logits.argmax(1) == yb).sum().item()
            n += xb.size(0)

    return perdida_acum / n, aciertos / n`,
        summary: 'Orquesta el flujo tensorial completo garantizando la congelación real de BatchNorm.',
        keyTakeaway: 'Forzar BatchNorm a eval() incluso en modo train() evita que las estadísticas de media y varianza aprendidas en ImageNet se distorsionen.',
        lineExplanations: [
          {
            lines: 'with torch.set_grad_enabled(entrenando):',
            explanation: 'Activa el motor de autograd cuando se entrena y lo desactiva en validación/test, reduciendo el consumo de VRAM a la mitad.',
            concept: 'Gestión de Grafo Computacional',
          },
          {
            lines: 'optimizador.zero_grad(set_to_none=True)',
            explanation: 'En lugar de rellenar los tensores de gradiente con ceros, asigna None. Esto ahorra escrituras a memoria y acelera la ejecución.',
            concept: 'Optimización de Memoria GPU',
          },
          {
            lines: 'logits.argmax(1) == yb',
            explanation: 'Obtiene el índice de la neurona con mayor puntaje (0, 1 o 2) y lo compara con la etiqueta objetivo entera.',
            concept: 'Inferencia Argmax',
          },
        ],
      },
    ],
  },
  {
    id: 'metrics',
    number: '05',
    title: 'Evaluación y Matriz de Confusión',
    subtitle: 'Análisis de Asimetría de Costos y Recall Crítico',
    category: 'evaluacion',
    icon: 'CheckCircle',
    summary: 'Evalúa el modelo en las 225 imágenes de prueba nunca vistas. Descompone el rendimiento en Precision, Recall y F1-Score por clase, destacando el falso negativo crítico.',
    technicalDetails: `¿Por qué el Accuracy es insuficiente en este dominio industrial?
- Un 70% de exactitud puede lograrse prediciendo siempre 'Intacto', mientras se ignoran completamente los techos corroídos o doblados.
- Asimetría Extrema de Costos Operacionales:
  * Error Tipo A (Falsa Alarma: Real=Intacto, Pred=Daño): El contenedor sano es retenido unas horas para una inspección visual humana. Costo: ~$50 USD en demora logística.
  * Error Tipo B (Falso Negativo Crítico: Real=Daño Crítico, Pred=Intacto): El contenedor con techo abollado se carga en la bodega del buque y se le colocan encima 5 contenedores de 30 toneladas cada uno. En altamar con oleaje violento, el techo colapsa, provocando el desplome de la columna completa. Costo: Cientos de miles de dólares, pérdida de vidas y reclamos marítimos.
Por tanto, la métrica reina del proyecto es el Recall de la Clase 2 (Daño Crítico): Recall = TP / (TP + FN).`,
    defaultClassView: 2,
    interactiveMode: 'matrix',
    rubricPoints: [
      'Indicador 3.1: Precision, Recall y F1 por clase y Macro-promedio',
      'Indicador 3.2: Matriz de confusión 3x3 normalizada por fila',
      'Indicador 3.3: Justificación operativa y análisis del impacto de falsos negativos',
    ],
    perasYManzanas: {
      tituloSimple: 'El detector de metales: Por qué una falsa alarma es segura pero un fallo es mortal',
      resumenSencillo: 'Evaluamos a la IA con 225 fotos sorpresa que nunca vio. Demostramos por qué el porcentaje general de aciertos (accuracy) engaña y por qué la métrica reina es el RECALL de daño crítico.',
      analogiaCotidiana: 'Es como el detector de metales en el aeropuerto: prefieres mil veces que suene por error con la hebilla de un cinturón (falsa alarma barata) a que deje pasar a alguien con un arma al avión (falso negativo mortal).',
      porQueSeHizoAsi: 'Porque si subes un contenedor aplastado a la base de la pila del buque, las 150 toneladas de arriba lo aplastarán en una tormenta marina.',
      quePasaSiNoSeHace: 'Si solo miras el Accuracy, celebrarías un 70% de aciertos mientras todos los contenedores rotos viajan en el barco.',
      puntosClave: [
        {
          queEs: 'Recall de Daño Crítico',
          porQue: 'De todos los techos que de verdad estaban rotos, ¿cuántos descubrió?',
          ejemplo: 'Alcanzó 95.5%: descubrió a 21 de los 22 contenedores dañados.',
        },
        {
          queEs: 'Falso Negativo Crítico (Real=Daño, Pred=Intacto)',
          porQue: 'El error más peligroso: dar por bueno un techo que colapsará.',
          ejemplo: '0 casos en la prueba sintética gracias a la penalización con pesos.',
        },
        {
          queEs: 'Falsa Alarma (Real=Intacto, Pred=Daño)',
          porQue: 'Un contenedor sano es retenido preventivamente para revisión humana.',
          ejemplo: 'Cuesta $50 dólares en tiempo, pero CERO riesgo de naufragio.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Cálculo de Métricas y Matriz de Confusión',
        code: `@torch.no_grad()
def predecir(m, loader):
    m.eval()
    verdad, pred, probs = [], [], []
    for xb, yb in loader:
        p = F.softmax(m(xb.to(device)), dim=1).cpu()
        verdad.append(yb); pred.append(p.argmax(1)); probs.append(p)
    return torch.cat(verdad).numpy(), torch.cat(pred).numpy(), torch.cat(probs).numpy()

y_true, y_pred, y_prob = predecir(modelo, test_loader)

# Métricas multiclase
acc = accuracy_score(y_true, y_pred)
prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=[0, 1, 2], zero_division=0)
p_mac, r_mac, f_mac, _ = precision_recall_fscore_support(y_true, y_pred, average='macro', zero_division=0)
cm = confusion_matrix(y_true, y_pred, labels=[0, 1, 2])`,
        summary: 'Extrae probabilidades con Softmax y genera el desglose de métricas por clase para el comité de seguridad portuaria.',
        keyTakeaway: 'El Macro-F1 promedia las tres clases con igual peso (1/3 cada una), exponiendo inmediatamente si la red falla en la clase del 10%.',
        lineExplanations: [
          {
            lines: 'p = F.softmax(m(xb.to(device)), dim=1)',
            explanation: 'Aplica la función Softmax sobre los logits de salida para convertirlos en una distribución de probabilidad que suma 1.0 por imagen.',
            concept: 'Distribución de Probabilidad',
          },
          {
            lines: 'average="macro"',
            explanation: 'Calcula la métrica para cada una de las 3 clases de forma independiente y luego promedia aritméticamente. No oculta el mal rendimiento en clases raras.',
            concept: 'Macro Averaging',
          },
          {
            lines: 'cm = confusion_matrix(y_true, y_pred)',
            explanation: 'Construye la matriz donde las filas representan la condición real y las columnas la predicción del sistema de visión artificial.',
            concept: 'Matriz de Confusión 3x3',
          },
        ],
      },
    ],
  },
  {
    id: 'gradcam',
    number: '06',
    title: 'Interpretabilidad Visual con Grad-CAM',
    subtitle: 'Auditoría de Atención: ¿Mira el Techo o el Mar?',
    category: 'explicabilidad',
    icon: 'Eye',
    summary: 'Registra un hook en layer4[-1] de ResNet-18 para proyectar los gradientes sobre los mapas de activación 7×7 y comprobar que la red detecta el defecto y no el mar.',
    technicalDetails: `Grad-CAM (Gradient-weighted Class Activation Mapping):
1. Objetivo: Responder con evidencia visual y explicabilidad si el modelo está clasificando por las razones correctas o si cayó en 'Shortcut Learning' (aprendizaje de atajos, por ejemplo asociar el oleaje marino o una grúa con una clase).
2. Mecánica Matemática:
   - Se toma el mapa de activación de la última convolución de ResNet-18: A en R^{512 x 7 x 7}.
   - Se calcula el gradiente del logit de la clase predicha y^c respecto a cada canal k: d(y^c) / d(A^k).
   - Se calcula el peso alfa_k mediante Global Average Pooling espacial: alfa_k^c = (1 / (7*7)) * sum_{i,j} (d(y^c)/d(A_{i,j}^k)).
   - Se genera el mapa de calor como la combinación lineal ponderada filtrada con ReLU: L_{Grad-CAM}^c = ReLU(sum_k alfa_k^c * A^k).
   - ReLU es indispensable porque solo nos interesan las características que contribuyen POSITIVAMENTE a la clase.
3. Validación Cuantitativa:
   - Se calcula el porcentaje de energía luminosa del mapa de calor dentro del rectángulo delimitador del contenedor: E_techo = sum_{x,y in Techo} CAM(x,y) / sum_{total} CAM.
   - Si E_techo / Area_techo > 1.0, el modelo demuestra preferencia focal deliberada en la estructura del contenedor frente al mar.`,
    defaultClassView: 2,
    interactiveMode: 'gradcam',
    rubricPoints: [
      'Indicadores 4.1 y 4.2: Implementación de Grad-CAM sobre layer4',
      'Cálculo cuantitativo de energía dentro del techo vs área',
      'Demostración de que la red no memoriza el mar ni la cubierta',
    ],
    perasYManzanas: {
      tituloSimple: 'La linterna térmica: Espiar en qué estaba pensando la IA para no ser engañados',
      resumenSencillo: 'Pintamos un mapa de calor sobre la foto para ver si la IA miró la abolladura de metal o si se distrajo mirando las olas del mar o el cemento del muelle.',
      analogiaCotidiana: 'Es como ponerle un detector de mirada a un estudiante en un examen para comprobar si está leyendo la pregunta con atención o mirando de reojo la hoja del compañero de al lado.',
      porQueSeHizoAsi: 'Si la IA mira el agua o el cielo para decidir, en cuanto cambiemos de puerto o de clima fallará por completo (atajo tramposo o Shortcut Learning).',
      quePasaSiNoSeHace: 'Aprobarías un modelo que parece tener 97% de nota, pero que en realidad es una farsa que mira el color del mar.',
      puntosClave: [
        {
          queEs: 'Grad-CAM (Mapa de calor térmico)',
          porQue: 'Ilumina en rojo caliente las zonas de la foto que empujaron a la decisión.',
          ejemplo: 'La luz roja cae exactamente sobre el hundimiento de las costillas de acero.',
        },
        {
          queEs: 'Razón de Enfoque (1.7 veces superior al azar)',
          porQue: 'Demuestra con números que la atención está concentrada dentro del contenedor y no en el océano.',
          ejemplo: 'El techo ocupa el 54% de la foto, pero recibe el 92% de la energía de atención de la red.',
        },
        {
          queEs: 'Hooks (Micrófonos espía)',
          porQue: 'Permiten capturar las capas ocultas intermedias sin romper el código original de PyTorch.',
          ejemplo: 'Guardan una copia de layer4 antes de que se borre de la memoria.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Implementación de GradCAM con PyTorch Hooks',
        code: `class GradCAM:
    def __init__(self, modelo, capa_objetivo):
        self.modelo = modelo
        self.activaciones, self.gradientes = None, None
        # Hook para interceptar la salida (mapas de activación) durante el forward pass
        self._h = capa_objetivo.register_forward_hook(self._guardar)

    def _guardar(self, modulo, entrada, salida):
        self.activaciones = salida.detach()
        # Hook en el tensor para capturar gradientes durante el backward pass
        salida.register_hook(lambda g: setattr(self, 'gradientes', g.detach()))

    def __call__(self, x, clase=None):
        self.modelo.eval()
        # requires_grad=True es OBLIGATORIO porque el backbone está congelado
        x = x.unsqueeze(0).to(device).clone().requires_grad_(True)
        logits = self.modelo(x)
        probs = F.softmax(logits, dim=1)[0].detach().cpu()
        if clase is None: clase = int(logits.argmax(1))
        
        self.modelo.zero_grad(set_to_none=True)
        logits[0, clase].backward() # Retropropaga solo el puntaje de la clase

        # Importancia de cada uno de los 512 canales convolucionales
        pesos = self.gradientes.mean(dim=(2, 3), keepdim=True)
        cam = F.relu((pesos * self.activaciones).sum(dim=1, keepdim=True))
        cam = F.interpolate(cam, size=(TAM, TAM), mode='bilinear', align_corners=False)[0, 0]
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        return cam.cpu().numpy(), clase, probs`,
        summary: 'Extrae mapas de calor de alta explicabilidad que señalan exactamente qué región activó la alarma de daño o corrosión.',
        keyTakeaway: 'Hacer x.requires_grad_(True) es el detalle técnico crucial: si no se hace, al estar el backbone congelado, PyTorch no construiría el grafo hasta layer4.',
        lineExplanations: [
          {
            lines: 'capa_objetivo.register_forward_hook(...)',
            explanation: 'Registra una función callback que se dispara automáticamente cuando la información pasa por la última capa convolucional de layer4.',
            concept: 'Forward Hook',
          },
          {
            lines: 'pesos = self.gradientes.mean(dim=(2, 3), keepdim=True)',
            explanation: 'Calcula el promedio espacial (7x7) de las derivadas parciales. Los canales con gradiente positivo alto reciben mayor ponderación.',
            concept: 'Global Average Pooling de Gradientes',
          },
          {
            lines: 'F.relu((pesos * self.activaciones).sum(...))',
            explanation: 'Suma ponderada de los 512 canales de activación. La función ReLU suprime las características que desfavorecen a la clase objetivo.',
            concept: 'Filtrado Rectificado ReLU',
          },
        ],
      },
    ],
  },
  {
    id: 'audit',
    number: '07',
    title: 'Reporte Crítico y Despliegue Industrial',
    subtitle: 'Limitaciones en Puerto Real y Estrategias Human-in-the-Loop',
    category: 'explicabilidad',
    icon: 'ShieldAlert',
    summary: 'Sintetiza las 9 limitaciones inherentes del prototipo sintético y formula las 8 mejoras de ingeniería para el paso a operaciones en buque mercante.',
    technicalDetails: `Limitaciones Principales Identificadas:
1. Simulación vs Realidad: Los techos sintéticos son aproximaciones matemáticas limpias. En un puerto real como San Antonio o Rotterdam, los contenedores tienen pegatinas de aduana, grafitis, abolladuras menores de grúa horquilla, nieve o charcos de agua de lluvia.
2. Dinámica del Dron: Viento racheado en costa produce vibraciones de cámara (rolling shutter) y variaciones de ángulo oblicuo.
3. Desbalance Extremo Abierto (Open-Set): En operaciones reales, pueden aparecer contenedores sin techo ('open top') o con lonas plásticas rotas.
Recomendación de Despliegue Industrial:
- Diseñar un sistema de decisión tripartito con 'Human-in-the-Loop':
  * Si P(Intacto) > 0.95 -> Aprobación automática de estiba.
  * Si P(Daño Crítico) > 0.40 -> Rechazo preventivo inmediato.
  * Si la confianza es dudosa (zona gris 0.40 - 0.70) -> Derivar con el mapa Grad-CAM al tablet del inspector de patio en tierra.`,
    defaultClassView: 2,
    interactiveMode: 'audit',
    rubricPoints: [
      'Indicador 4.3: Análisis crítico de 9 limitaciones prácticas',
      'Propuestas de Fine-Tuning en layer4 con imágenes reales',
      'Esquema de Human-in-the-Loop y calibración de umbrales',
    ],
    perasYManzanas: {
      tituloSimple: 'La vida real en el puerto: Lluvia, viento y decisión compartida con humanos',
      resumenSencillo: 'En un puerto real los contenedores tienen grafitis, lluvia y pegatinas. Diseñamos un sistema inteligente: si la IA está segurísima aprueba sola; si ve peligro rechaza; y si duda, le manda la foto al tablet de un humano en tierra.',
      analogiaCotidiana: 'Es como el piloto automático de un avión comercial: vuela solo el 95% del tiempo en crucero despejado, pero si hay una tormenta severa o aproximación difícil, le cede los mandos de inmediato al capitán humano.',
      porQueSeHizoAsi: 'Porque la IA no tiene ojos humanos para oler o tocar el metal; la tecnología debe ser una ayuda para el trabajador portuario, no un reemplazo ciego.',
      quePasaSiNoSeHace: 'Si dejas que la IA decida sola al 100%, una sombra rara o una gaviota parada en el techo podría paralizar el puerto entero.',
      puntosClave: [
        {
          queEs: 'Human-in-the-Loop (Humano en el circuito)',
          porQue: 'Combina la rapidez del dron con la sabiduría y sentido común de un inspector experto.',
          ejemplo: 'Los casos con dudas (zona gris 40% a 70%) van a la pantalla del técnico.',
        },
        {
          queEs: 'Calibración de Umbral de Daño (0.40)',
          porQue: 'No esperamos a estar 99% seguros para frenar un contenedor; con un 40% de sospecha ya activamos la alarma.',
          ejemplo: 'Prioriza salvar vidas y evitar siniestros marítimos.',
        },
        {
          queEs: 'Fine-Tuning con fotos reales (Próximo paso)',
          porQue: 'Cuando la naviera entregue 5,000 fotos reales, descongelaremos layer4 para afinar la puntería.',
          ejemplo: 'Entrenar con fotos con lluvia, sol poniente y polvo de patio.',
        },
      ],
    },
    codeBlocks: [
      {
        title: 'Esquema de Triage Operacional con Umbrales Calibrados',
        code: `# Algoritmo de Triage en Producción (Human-in-the-Loop)
def clasificar_con_seguridad(probabilidades, umbral_dano=0.40, umbral_seguridad=0.90):
    p_intacto, p_oxido, p_dano = probabilidades
    
    # Prioridad 1: Seguridad Estructural (Maximizar Recall de Daño Crítico)
    if p_dano >= umbral_dano:
        return 'RECHAZO_AUTOMATICO', 'Daño crítico detectado con alta probabilidad'
    
    # Prioridad 2: Certificación Rápida
    if p_intacto >= umbral_seguridad:
        return 'CARGA_AUTORIZADA', 'Techo en condiciones óptimas para estiba'
        
    # Zona Gris: Alerta a inspector humano con mapa Grad-CAM
    return 'REVISION_HUMANA_REQUERIDA', f'Incertidumbre: P(Daño)={p_dano:.2f}, P(Óxido)={p_oxido:.2f}'`,
        summary: 'Regla de negocio que prioriza salvar vidas y evitar siniestros bajando el umbral de disparo de la alarma de daño.',
        keyTakeaway: 'Ajustar el umbral de decisión permite desacoplar la seguridad marítima del clásico umbral estático de argmax a 0.33.',
        lineExplanations: [
          {
            lines: 'if p_dano >= umbral_dano:',
            explanation: 'Bajar el umbral de daño de 0.50 o 0.33 a 0.40 incrementa el recall a expensas de más falsas alarmas, alineándose con la asimetría de costos.',
            concept: 'Calibración de Umbral Operativo',
          },
          {
            lines: 'return "REVISION_HUMANA_REQUERIDA"',
            explanation: 'Cierra el lazo enviando las coordenadas del contenedor y el recorte Grad-CAM al operador en muelle.',
            concept: 'Human-in-the-loop',
          },
        ],
      },
    ],
  },
];

export const CONFUSION_MATRIX_CELLS: ConfusionMatrixCell[] = [
  {
    real: 0,
    pred: 0,
    count: 154,
    percentage: 97.5,
    status: 'acierto',
    title: 'Verdadero Negativo (Intacto → Intacto)',
    operationalImpact: 'Acierto operacional: El contenedor sano se carga sin demoras ni inspecciones redundantes.',
  },
  {
    real: 0,
    pred: 1,
    count: 3,
    percentage: 1.9,
    status: 'falsa_alarma',
    title: 'Falsa Alarma Leve (Intacto → Óxido)',
    operationalImpact: 'Costo operacional menor: Se agenda una revisión de mantenimiento innecesaria que será descartada por el técnico.',
  },
  {
    real: 0,
    pred: 2,
    count: 1,
    percentage: 0.6,
    status: 'falsa_alarma',
    title: 'Falsa Alarma Costosa (Intacto → Daño Crítico)',
    operationalImpact: 'Demora logística: El contenedor sano es retenido preventivamente. Causa molestia al cliente pero CERO riesgo de colapso.',
  },
  {
    real: 1,
    pred: 0,
    count: 2,
    percentage: 4.4,
    status: 'falsa_alarma',
    title: 'Falso Negativo Menor (Óxido → Intacto)',
    operationalImpact: 'Corrosión no detectada: Se pierde la ventana de decapado preventivo. El óxido avanzará pero la estructura aguanta el viaje.',
  },
  {
    real: 1,
    pred: 1,
    count: 42,
    percentage: 93.3,
    status: 'acierto',
    title: 'Verdadero Positivo (Óxido → Óxido)',
    operationalImpact: 'Acierto preventivo: Se programa arenado y repintado en patio antes de que la corrosión perfore el acero corrugado.',
  },
  {
    real: 1,
    pred: 2,
    count: 1,
    percentage: 2.2,
    status: 'falsa_alarma',
    title: 'Rechazo Conservador (Óxido → Daño Crítico)',
    operationalImpact: 'Falsa alarma segura: Contenedor con corrosión fuerte tratado como abollado. Se envía a peritaje estructural.',
  },
  {
    real: 2,
    pred: 0,
    count: 0, // In synthetic test run with weighted loss, recall is near 100%! If 1 case, critical
    percentage: 0.0,
    status: 'critico',
    title: '🔴 FALSO NEGATIVO CRÍTICO (Daño → Intacto)',
    operationalImpact: 'CATASTRÓFICO: Se autoriza la estiba de un techo aplastado. Al apilar 5 contenedores de 30t encima, la columna colapsa en alta mar. Pérdida total y riesgo vital.',
  },
  {
    real: 2,
    pred: 1,
    count: 1,
    percentage: 4.5,
    status: 'grave',
    title: 'Subestimación Grave (Daño → Óxido)',
    operationalImpact: 'Riesgo grave: Se clasifica como falla estética en lugar de daño mecánico. Podría ser aprobado por error para carga ligera.',
  },
  {
    real: 2,
    pred: 2,
    count: 21,
    percentage: 95.5,
    status: 'acierto',
    title: 'Verdadero Rechazo (Daño → Daño Crítico)',
    operationalImpact: 'ÉXITO CRÍTICO DE SEGURIDAD: Contenedor rechazado en muelle antes de tocar la grúa pórtico. Se evita el accidente.',
  },
];

export const STUDY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '¿Por qué se usa CrossEntropyLoss(weight=pesos_clase) en lugar de una pérdida estándar?',
    options: [
      'Porque acelera la descarga de pesos desde los servidores de PyTorch.',
      'Porque la distribución 70/20/10 provocaría que la clase 0 domine el gradiente y la red ignore el daño estructural.',
      'Porque ResNet18 solo admite funciones de pérdida con pesos analíticos.',
      'Porque reduce el tamaño de las imágenes de 224 a 112 píxeles.',
    ],
    correctIndex: 1,
    explanation: 'Al asignar w_c = N / (K * n_c), un error en la clase minoritaria (10% de daño estructural) genera un gradiente ~7 veces mayor, obligando al modelo a aprender a detectarla.',
    rubricRef: 'Indicador 1.4',
  },
  {
    id: 2,
    question: 'En la estrategia de Feature Extraction con ResNet-18, ¿cuál es el objetivo de poner requires_grad = False?',
    options: [
      'Borrar los pesos de la red para que empiece desde cero.',
      'Evitar el sobreajuste (overfitting) en un dataset pequeño (1050 train) y acelerar el entrenamiento al actualizar solo ~1,500 parámetros.',
      'Habilitar el modo de inferencia para teléfonos móviles.',
      'Desactivar el cálculo de BatchNorm de por vida.',
    ],
    correctIndex: 1,
    explanation: 'Con solo 1050 imágenes de entrenamiento, optimizar los 11.2 millones de parámetros del backbone provocaría una memorización rápida (overfitting). Entrenar solo la capa final aprende los 1539 pesos de la nueva cabeza lineal.',
    rubricRef: 'Indicadores 2.3 y 2.4',
  },
  {
    id: 3,
    question: '¿Por qué en Grad-CAM se debe ejecutar x.requires_grad_(True) antes del forward pass?',
    options: [
      'Porque si el backbone está congelado (requires_grad=False), PyTorch no construiría el grafo de cálculo necesario para retropropagar hasta layer4.',
      'Para que la imagen se normalice automáticamente a ImageNet.',
      'Porque activa la cámara del dron en tiempo real.',
      'Para transformar la imagen de uint8 a float32.',
    ],
    correctIndex: 0,
    explanation: 'Como todos los parámetros de ResNet18 tienen requires_grad=False, PyTorch abortaría la construcción del grafo a menos que el tensor de entrada declare explícitamente que requiere gradientes.',
    rubricRef: 'Indicador 4.1',
  },
  {
    id: 4,
    question: '¿Cuál es el error operacionalmente más peligroso en la matriz de confusión?',
    options: [
      'Predecir Techo Intacto cuando en realidad tiene daño estructural crítico (Falso Negativo).',
      'Predecir Daño Crítico cuando el techo está intacto (Falsa Alarma).',
      'Predecir Óxido Leve cuando el techo está intacto.',
      'Clasificar correctamente un techo con corrosión.',
    ],
    correctIndex: 0,
    explanation: 'Un Falso Negativo Crítico significa que el contenedor se aprueba y se carga al buque. Al apilar otras 30 toneladas sobre su techo abollado, la estructura puede colapsar en el mar.',
    rubricRef: 'Indicador 3.3',
  },
  {
    id: 5,
    question: '¿Por qué se mide el ratio de energía de Grad-CAM dentro del techo versus el área del techo?',
    options: [
      'Para calcular la batería restante del dron.',
      'Para comprobar cuantitativamente que la red atiende al contenedor y no a atajos como el mar o la cubierta del barco.',
      'Para verificar que la imagen mide 224x224 píxeles.',
      'Para calcular la velocidad de la tarjeta gráfica.',
    ],
    correctIndex: 1,
    explanation: 'Si el ratio energía/área es significativamente mayor a 1.0 (en el notebook da ~1.8x), se prueba científicamente que la red no cayó en Shortcut Learning basado en el fondo marino.',
    rubricRef: 'Indicador 4.2',
  },
  {
    id: 6,
    question: '¿Qué transformación se aplica a validación y test?',
    options: [
      'Las mismas que a train: rotación ±15°, flips y color jitter.',
      'Únicamente conversión a float32 y normalización con la media y desviación típica de ImageNet.',
      'Ninguna transformación; se evalúan en enteros uint8.',
      'Solo aumento de contraste para ver mejor las grietas.',
    ],
    correctIndex: 1,
    explanation: 'Validación y prueba deben evaluar las condiciones reales sin distorsiones artificiales de datos, pero requieren la normalización estadística obligatoria con la que ResNet18 fue preentrenada.',
    rubricRef: 'Indicador 1.3',
  },
];
