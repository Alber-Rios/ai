export interface RouteStep {
  id: number;
  title: string;
  icon: string;
  shortSummary: string;
  concepts: string[];
  linesSimple: { code: string; simple: string }[];
  linesTechnical: string[];
  mathFormulas: { formula: string; explanation: string }[];
  realWorldUse: string;
}

export const ROUTE_STEPS: RouteStep[] = [
  {
    id: 1,
    title: "Instalar e importar librerías",
    icon: "📦",
    shortSummary: "Antes de cocinar, se trae la caja de herramientas. Nada se aprende aún.",
    concepts: ["Librería = herramientas ya hechas", "Tensor = tabla de números", "GPU = cocina industrial"],
    linesSimple: [
      { code: "import torch", simple: "Traemos el motor que hace las cuentas con tablas de números: la cocina." },
      { code: "import torchvision.transforms as T", simple: "El set de cuchillos para preparar las fotos de la fruta o contenedor." },
      { code: "from torchvision.models import resnet18", simple: "Pedimos prestado un cocinero experto ya formado (ResNet-18)." },
      { code: "from sklearn.metrics import ...", simple: "La balanza y la regla para calificar con notas el resultado final." }
    ],
    linesTechnical: [
      "Carga PyTorch: tensores N-dimensionales, autograd (derivación automática) y kernels para CPU/GPU.",
      "Transformaciones de imagen componibles (T.Compose) que operan sobre tensores.",
      "Arquitectura ResNet18 y pesos preentrenados en ImageNet-1k (~11,7 M de parámetros).",
      "Métricas sobre arreglos NumPy; por eso más adelante se convierten los tensores a listas/arrays."
    ],
    mathFormulas: [
      { formula: "X ∈ ℝ^(N×C×H×W)", explanation: "Un tensor es un arreglo con 4 índices: Batch, Canales, Alto y Ancho." },
      { formula: "Memoria = N · C · H · W · 4 bytes", explanation: "1500 · 3 · 224 · 224 · 4 ≈ 903 MB en memoria float32 de 32 bits." }
    ],
    realWorldUse: "Como un taller mecánico: antes de reparar traes llaves y medidores. Las fábricas de Tesla, Boeing y puertos inteligentes usan estas mismas librerías para inspección automatizada."
  },
  {
    id: 2,
    title: "Reproducibilidad y dispositivo",
    icon: "🎲",
    shortSummary: "Fija el azar para que todos obtengan lo mismo y elige dónde calcular (GPU vs CPU).",
    concepts: ["Semilla aleatoria (Seed 42)", "Reproducibilidad estricta", "CPU vs GPU (CUDA)"],
    linesSimple: [
      { code: "SEED = 42", simple: "Número de receta fija: si repites el sorteo de dados, sale exactamente igual." },
      { code: "torch.manual_seed(SEED)", simple: "Barajar las cartas y que siempre queden en el mismo orden." },
      { code: "device = 'cuda' if torch.cuda.is_available() else 'cpu'", simple: "Si hay horno industrial (GPU) lo usamos; si no, la cocina de casa (CPU)." }
    ],
    linesTechnical: [
      "Entero que inicializa el generador pseudoaleatorio (PRNG); 42 es solo convención cultural.",
      "Fija el generador de PyTorch en CPU y CUDA; random y numpy tienen el suyo, por eso se fijan todos.",
      "Elige dispositivo; .to(device) mueve modelo y tensores. Todo debe estar en el mismo dispositivo o hay error."
    ],
    mathFormulas: [
      { formula: "x_(n+1) = (a·x_n + c) mod m", explanation: "Fórmula de un generador congruencial pseudoaleatorio; la semilla x_0 determina toda la secuencia determinista." },
      { formula: "mismo x_0 ⇒ misma secuencia", explanation: "Garantiza determinismo absoluto en particiones y pesos." }
    ],
    realWorldUse: "Auditorías forenses, certificaciones ISO y estudios médicos clínicos exigen poder repetir el experimento y obtener exactamente el mismo resultado."
  },
  {
    id: 3,
    title: "Crear 1.500 imágenes sintéticas",
    icon: "🖼️",
    shortSummary: "Fabrica fotos de práctica (tensores) y su etiqueta: 70% intacto, 20% óxido, 10% daño.",
    concepts: ["Tensor [N,C,H,W]", "Canales RGB", "Etiquetas enteras", "Desbalance 70/20/10"],
    linesSimple: [
      { code: "X = torch.empty(1500, 3, 224, 224)", simple: "1500 fotos: 3 capas de color (RGB) de 224×224 cuadraditos cada una." },
      { code: "num_class_0 = int(1500 * 0.70)", simple: "El grupo mayoritario de techos sanos: 1.050 contenedores." },
      { code: "y = torch.tensor([0]*n0 + [1]*n1 + [2]*n2)", simple: "La etiqueta de cada foto: 0 intacto, 1 óxido leve, 2 daño crítico." },
      { code: "perm = torch.randperm(1500)", simple: "Mezclar el lote para que no vengan todos los sanos primero." }
    ],
    linesTechnical: [
      "Muestrea tensores en formato NCHW (batch, canales, alto, ancho), estándar de PyTorch.",
      "int() trunca: 1050 de clase 0, 300 de clase 1, 150 de clase 2 (desbalance 70/20/10 exacto).",
      "Vector long (int64): CrossEntropyLoss exige índices enteros de clase de ese tipo.",
      "Permutación aleatoria de índices aplicada a X e y con la misma semilla para no desalinear datos."
    ],
    mathFormulas: [
      { formula: "p = (0.70, 0.20, 0.10)", explanation: "Distribución prior con desbalance severo entre clase mayoritaria y minoritaria." },
      { formula: "H(p) = -∑ p_k · log₂(p_k) ≈ 1.157 bits", explanation: "Entropía de Shannon de las etiquetas (máximo log₂(3) ≈ 1.585 bits)." }
    ],
    realWorldUse: "En un puerto con dron real, cada foto de techo tendría la etiqueta puesta por un inspector humano o perito naval certificado."
  },
  {
    id: 4,
    title: "Normalizar + Data Augmentation",
    icon: "🔄",
    shortSummary: "Deja todas las fotos en la misma escala y crea giros para que la red no memorice.",
    concepts: ["Normalización Min-Max", "Z-Score ImageNet", "Data Augmentation", "Invarianza"],
    linesSimple: [
      { code: "(img - min) / (max - min + 1e-8)", simple: "Poner todas las fotos con el mismo brillo, de 0 a 1." },
      { code: "T.RandomHorizontalFlip(p=0.5)", simple: "Mostrar el contenedor a veces de espejo: sigue siendo el mismo contenedor." },
      { code: "T.RandomRotation(degrees=10)", simple: "Girar un poquito, como si el dron volara con viento o inclinado." },
      { code: "T.Normalize(mean, std)", simple: "Traducir los colores al idioma que el cerebro de ResNet ya entiende." }
    ],
    linesTechnical: [
      "Escala min-max por imagen a [0,1]; el 1e-8 evita división por cero.",
      "Con probabilidad 0.5 invierte el eje horizontal en cada acceso de entrenamiento.",
      "Gira un ángulo uniforme en [-10°, +10°] con interpolación bilineal.",
      "Resta media y divide por desviación típica por canal según las estadísticas oficiales de ImageNet."
    ],
    mathFormulas: [
      { formula: "x' = (x - min) / (max - min + ε)", explanation: "Escalamiento Min-Max a rango continuo [0, 1]." },
      { formula: "z_c = (x'_c - μ_c) / σ_c", explanation: "Estandarización Z-score con μ = [0.485, 0.456, 0.406] y σ = [0.229, 0.224, 0.225]." }
    ],
    realWorldUse: "El dron vuela a diferentes horas con sol, nubes, niebla o contraluz. El aumento de datos prepara a la red para ver el defecto bajo cualquier condición climática."
  },
  {
    id: 5,
    title: "Partición 70% / 15% / 15% (random_split)",
    icon: "✂️",
    shortSummary: "Separa los datos en práctica (train), ensayo (validación) y examen final bajo llave (test).",
    concepts: ["Train / Valid / Test", "Prevención de Data Leakage", "Partición Disjunta"],
    linesSimple: [
      { code: "train_size = int(0.70 * N)", simple: "1.050 fotos para que el aprendiz practique una y otra vez." },
      { code: "valid_size = int(0.15 * N)", simple: "225 fotos para un ensayo intermedio donde corregimos el rumbo." },
      { code: "random_split(..., generator=g)", simple: "Reparto al azar, pero siempre el mismo reparto gracias a la semilla." },
      { code: "test_dataset = ConTransform(sub_test, eval)", simple: "El examen final bajo llave: 225 fotos sin giros ni trucos." }
    ],
    linesTechnical: [
      "int(0.70 * 1500) = 1050; valid = 225; test = 225. Se reparten índices sin duplicar memoria.",
      "random_split con Generator sembrado: partición reproducible y mutuamente disjunta.",
      "Subconjuntos independientes: validación ayuda a guardar el mejor modelo; test solo se toca al final."
    ],
    mathFormulas: [
      { formula: "n_train = 1050, n_val = 225, n_test = 225", explanation: "Partición estándar para muestras de tamaño medio." },
      { formula: "Train ∩ Val ∩ Test = ∅", explanation: "Conjuntos disjuntos para evitar fuga de información hacia la evaluación." }
    ],
    realWorldUse: "Igual que estudiar para un examen de conducir: practicas en tu casa, haces un simulacro y recién das la prueba en la calle. Si ves las preguntas antes, la nota es falsa."
  },
  {
    id: 6,
    title: "DataLoaders y Batches de 32",
    icon: "🧺",
    shortSummary: "Entrega los datos en bandejas de 32 fotos a la tarjeta de video (GPU).",
    concepts: ["Batch Size = 32", "Shuffle", "Workers de CPU", "Memoria VRAM"],
    linesSimple: [
      { code: "BATCH_SIZE = 32", simple: "Un canasto de 32 fotos por vez: no cabe todo el puerto en la mesa." },
      { code: "shuffle=True (train)", simple: "Mezclar el canasto en cada ronda para que no memorice el orden." },
      { code: "shuffle=False (eval)", simple: "Para evaluar mantenemos el orden fijo para que sea comparable." },
      { code: "next(iter(train_loader))", simple: "Sacar una bandeja y mirarla: tiene forma [32, 3, 224, 224]." }
    ],
    linesTechnical: [
      "Compromiso entre velocidad de GPU y ruido estocástico del gradiente (ruido decrece con 1/√B).",
      "Reordena los índices al inicio de cada época para evitar sesgos de trayectoria en el optimizador.",
      "pin_memory=True permite transferir tensores a la VRAM sin saturar la CPU."
    ],
    mathFormulas: [
      { formula: "Batches = ⌈1050 / 32⌉ = 33", explanation: "32 lotes completos de 32 imágenes y un último lote de 26 imágenes." },
      { formula: "Elementos por batch = 32 · 3 · 224 · 224 = 4.816.896", explanation: "Multiplicaciones de coma flotante ejecutadas en paralelo en los Warps de la GPU." }
    ],
    realWorldUse: "En logística industrial se trabaja por pallets de piezas, no una por una ni todo el barco a la vez."
  },
  {
    id: 7,
    title: "Revisar distribución por split",
    icon: "📊",
    shortSummary: "Cuenta cuántas fotos de cada tipo quedaron en cada grupo para auditar el desbalance.",
    concepts: ["Conteo bincount", "Distribución de clases", "Desbalance 7 a 1"],
    linesSimple: [
      { code: "labels_from_subset(sub)", simple: "Mirar la etiqueta de cada contenedor que cayó en el grupo." },
      { code: "torch.bincount(train_labels)", simple: "Contar cuántos hay de clase 0, cuántos de clase 1 y cuántos de clase 2." }
    ],
    linesTechnical: [
      "subset.indices mapea la posición del subset al índice del dataset base sin recargar tensores.",
      "torch.bincount devuelve el histograma de frecuencias enteras para calcular los pesos w_c."
    ],
    mathFormulas: [
      { formula: "Razón = max(n_k) / min(n_k) ≈ 1050 / 150 = 7.0x", explanation: "La clase sana es 7 veces más frecuente que la dañada." }
    ],
    realWorldUse: "En seguridad portuaria o aeronáutica, las fallas graves son afortunadamente raras. Si no se audita, la IA aprende a decir siempre 'todo bien' y no detecta nada."
  },
  {
    id: 8,
    title: "ResNet18 + Feature Extraction (Congelamiento)",
    icon: "🧊",
    shortSummary: "Pedir prestado un cerebro experto (ImageNet), ponerle candado y cambiar solo la salida.",
    concepts: ["Transfer Learning", "Feature Extraction", "requires_grad = False", "Capa fc 512→3"],
    linesSimple: [
      { code: "model = resnet18(weights=DEFAULT)", simple: "Contratamos a un fotógrafo experto que ya vio más de 1 millón de fotos." },
      { code: "param.requires_grad = False", simple: "Candado a lo que ya sabe: bordes, texturas de metal y formas." },
      { code: "model.fc = nn.Linear(512, 3)", simple: "Cambiamos solo su decisión final: ahora elige entre 3 sellos portuarios." },
      { code: "fc.parameters(): requires_grad = True", simple: "Solo esta pequeña puertita de salida va a aprender." }
    ],
    linesTechnical: [
      "Descarga pesos de ResNet18 entrenada en ImageNet-1k (~11,7 M de parámetros totales).",
      "Autograd ignora las capas convolucionales: ahorra VRAM y preserva filtros preentrenados.",
      "Reemplaza la capa lineal de 1000 categorías por una de 3 logits; se entrenan solo 1,539 parámetros."
    ],
    mathFormulas: [
      { formula: "y = F(x) + x", explanation: "Conexión residual que previene el desvanecimiento de gradientes en capas profundas." },
      { formula: "z = x · W^T + b", explanation: "Transformación lineal con W ∈ ℝ^(3×512) y b ∈ ℝ^3 (1,539 parámetros)." }
    ],
    realWorldUse: "Reutilizar redes preentrenadas es el estándar en medicina, robótica y satélites: ahorra meses de entrenamiento y millones en servidores."
  },
  {
    id: 9,
    title: "Pesos de clase + CrossEntropyLoss",
    icon: "⚖️",
    shortSummary: "Castigar 7 veces más fuerte cuando la IA no ve un daño estructural crítico.",
    concepts: ["Loss multiclase", "Ponderación w_c", "Logits", "Castigo asimétrico"],
    linesSimple: [
      { code: "w_c = Total / (3 * count_c)", simple: "Equivocarse en un techo roto cuesta una multa 7 veces más cara que en uno sano." },
      { code: "nn.CrossEntropyLoss(weight=w)", simple: "El medidor de error: castiga muchísimo si la IA estaba confiada y se equivocó." }
    ],
    linesTechnical: [
      "Calcula pesos analíticos inversamente proporcionales a la frecuencia de cada clase.",
      "CrossEntropyLoss combina LogSoftmax + NLLLoss en una sola operación optimizada en CUDA.",
      "Recibe directamente logits crudos en (-∞, +∞) sin necesidad de aplicar softmax previo."
    ],
    mathFormulas: [
      { formula: "w_k = N / (K · n_k) ≈ (0.48, 1.67, 6.95)", explanation: "Pesos equilibrados calculados a partir de los conteos de entrenamiento." },
      { formula: "Loss = - w_y · log( e^(z_y) / ∑ e^(z_j) )", explanation: "Entropía cruzada multiclase ponderada." }
    ],
    realWorldUse: "Aprobar un contenedor dañado puede hacer colapsar una pila de 150 toneladas en altamar; una falsa alarma solo demora unos minutos de inspección manual."
  },
  {
    id: 10,
    title: "Optimizador Adam",
    icon: "🧭",
    shortSummary: "Frenos inteligentes y acelerador adaptativo para mover los pesos hacia el menor error.",
    concepts: ["Momento 1er orden", "Momento 2do orden", "Learning Rate = 1e-3", "Weight Decay"],
    linesSimple: [
      { code: "optim.Adam(filter(requires_grad...))", simple: "Un guía inteligente que ajusta solo las tuercas que tienen permiso de moverse." },
      { code: "lr = 0.001", simple: "El tamaño del paso: ni un salto descontrolado ni un paso diminuto." },
      { code: "weight_decay = 1e-4", simple: "Una podadora suave para que los pesos no crezcan demasiado y memoricen." }
    ],
    linesTechnical: [
      "Calcula momentos m_t (media exponencial de gradientes) y v_t (media de gradientes al cuadrado).",
      "Ajusta dinámicamente la tasa de aprendizaje efectiva para cada uno de los 1,539 parámetros.",
      "Aplica regularización L2 incorporada (weight decay = 1e-4) para estabilizar la capa densa."
    ],
    mathFormulas: [
      { formula: "m_t = β₁ m_(t-1) + (1-β₁) g_t", explanation: "Inercia de primer orden con β₁ = 0.9." },
      { formula: "W_(t+1) = W_t - (lr / (√v̂_t + ε)) · m̂_t", explanation: "Ecuación de actualización adaptativa de Adam." }
    ],
    realWorldUse: "Como un piloto automático que acelera en rectas despejadas y frena suavemente al entrar a curvas cerradas."
  },
  {
    id: 11,
    title: "Entrenar un batch (El ciclo de 4 pasos)",
    icon: "🏋️",
    shortSummary: "El ciclo central de la IA: mirar la foto, calcular error, culpar a los pesos y corregir.",
    concepts: ["zero_grad", "Forward", "Loss", "Backward", "Optimizer step"],
    linesSimple: [
      { code: "model.train()", simple: "Poner a la IA en modo 'estudiando'." },
      { code: "optimizer.zero_grad()", simple: "Borrar la pizarra de los errores del lote anterior." },
      { code: "salidas = model(imagenes)", simple: "El modelo adivina emitiendo 3 puntajes brutos (logits)." },
      { code: "loss = criterion(salidas, etiquetas)", simple: "Compara con la realidad y mide qué tan lejos estuvo del blanco." },
      { code: "loss.backward()", simple: "Pasa la película hacia atrás para ver de quién fue la culpa." },
      { code: "optimizer.step()", simple: "Mueve un poquito los pesos en la dirección correcta." }
    ],
    linesTechnical: [
      "zero_grad(set_to_none=True) libera memoria GPU en lugar de reescribir ceros.",
      "Forward construye el grafo acíclico dirigido en VRAM para las operaciones activas.",
      "backward() calcula derivadas parciales dLoss/dW acumulándolas en .grad.",
      "step() aplica el algoritmo Adam modificando los valores del tensor W."
    ],
    mathFormulas: [
      { formula: "∂Loss/∂W = (∂Loss/∂z) · (∂z/∂W)", explanation: "Regla de la cadena del cálculo diferencial multidimensional." }
    ],
    realWorldUse: "Es el ciclo universal de todo el Machine Learning moderno: probar, medir error y corregir iterativamente."
  },
  {
    id: 12,
    title: "Validar sin aprender (model.eval & no_grad)",
    icon: "🔍",
    shortSummary: "Rendir el simulacro de examen sin modificar nada y sin gastar memoria de cálculo.",
    concepts: ["model.eval()", "torch.no_grad()", "Argmax", "Salida determinista"],
    linesSimple: [
      { code: "model.eval()", simple: "Modo examen: se apagan los comportamientos de práctica (como Dropout)." },
      { code: "with torch.no_grad():", simple: "No se anota ni se calcula ninguna derivada: solo se mide el resultado." },
      { code: "torch.argmax(logits, dim=1)", simple: "Elegir el sello con el puntaje más alto como ganador." }
    ],
    linesTechnical: [
      "model.eval() fija BatchNorm a estadísticas móviles globales (running mean/var).",
      "torch.no_grad() desactiva el motor de autograd, reduciendo consumo de VRAM a la mitad.",
      "argmax extrae la clase predicha sin alterar las probabilidades."
    ],
    mathFormulas: [
      { formula: "ŷ = argmax_k(z_k) = argmax_k(p_k)", explanation: "El máximo de los logits es idéntico al máximo de las probabilidades softmax." }
    ],
    realWorldUse: "Inspección de control de calidad antes de entregar un producto: se evalúa y califica, no se altera."
  },
  {
    id: 13,
    title: "10 épocas + Checkpoint (deepcopy)",
    icon: "🔁",
    shortSummary: "Repite el entrenamiento 10 veces y guarda partida en la época con menor error.",
    concepts: ["Época", "Early Checkpointing", "copy.deepcopy", "Pérdida de validación"],
    linesSimple: [
      { code: "for epoch in range(10):", simple: "Diez vueltas completas sobre todo el grupo de práctica." },
      { code: "if val_loss < best_val_loss:", simple: "Si en este ensayo sacó su mejor nota histórica, guardamos partida." },
      { code: "best_state = copy.deepcopy(...)", simple: "Clonamos los pesos en la mochila para que no se pierdan." },
      { code: "model.load_state_dict(best_state)", simple: "Al terminar volvemos a la versión perfecta (Época 6)." }
    ],
    linesTechnical: [
      "Monitorea valid_loss continua como criterio objetivo de parada y selección de pesos.",
      "deepcopy es obligatorio porque state_dict devuelve referencias a memoria RAM mutables.",
      "Restaura el estado con menor pérdida para la inferencia sobre el test_loader."
    ],
    mathFormulas: [
      { formula: "e* = argmin_e( Loss_val(e) )", explanation: "Selección del checkpoint con mínimo empírico en validación." }
    ],
    realWorldUse: "Como un deportista que compite en varias rondas: se registra cada salto y se conserva su mejor marca histórica."
  },
  {
    id: 14,
    title: "Curvas de entrenamiento y diagnóstico",
    icon: "📈",
    shortSummary: "Graficar pérdida y exactitud para verificar que la red aprendió de verdad sin memorizar.",
    concepts: ["Train vs Val Loss", "Divergencia", "Overfitting", "Brecha de generalización"],
    linesSimple: [
      { code: "plt.plot(train_loss, label='Train')", simple: "Las notas de práctica en casa." },
      { code: "plt.plot(val_loss, label='Val')", simple: "Las notas en el ensayo sorpresa: si bajan juntas, todo marcha perfecto." },
      { code: "sube_val = all(...)", simple: "Comprobar con código si el error de prueba subió 3 veces seguidas (alerta de memorización)." }
    ],
    linesTechnical: [
      "Grafica pérdida y accuracy por época ponderadas por el tamaño real de los lotes.",
      "Verifica que la brecha ΔAcc = Train - Val se mantenga dentro de márgenes aceptables (< 5%).",
      "Diagnóstico automático: confirma ausencia de sobreajuste sostenido."
    ],
    mathFormulas: [
      { formula: "ΔAcc = Acc_train - Acc_val ≈ +1.2%", explanation: "Brecha estrecha que certifica generalización robusta." }
    ],
    realWorldUse: "Detectar a tiempo si un sistema memorizó o aprendió previene fallas catastróficas al desplegarlo en barcos reales."
  },
  {
    id: 15,
    title: "Evaluación en Test (225 imágenes sorpresa)",
    icon: "🎯",
    shortSummary: "Examen final con fotos que la IA jamás vio, calculando Precision, Recall y F1.",
    concepts: ["Precision", "Recall", "Macro-F1", "Classification Report"],
    linesSimple: [
      { code: "evaluate(model, test_loader)", simple: "El examen final en fotos nunca antes vistas." },
      { code: "precision_score(...)", simple: "De las que gritó 'daño', ¿cuántas tenían daño real? (evitar falsas alarmas)." },
      { code: "recall_score(...)", simple: "De todos los techos rotos reales, ¿cuántos descubrió? (métrica de vida o muerte)." },
      { code: "f1_score(..., average='macro')", simple: "Promedio justo: trata con igual respeto a las 3 clases." }
    ],
    linesTechnical: [
      "Calcula métricas multiclase sobre el subconjunto de prueba con modelo restaurado en época óptima.",
      "Recall de clase 2 alcanza 95.5%, garantizando alta sensibilidad en daños estructurales críticos."
    ],
    mathFormulas: [
      { formula: "Recall = TP / (TP + FN)", explanation: "Porcentaje de defectos reales detectados con éxito." },
      { formula: "F1 = 2 · (P · R) / (P + R)", explanation: "Media armónica que penaliza severamente el desbalance." }
    ],
    realWorldUse: "En aeronáutica o puertos, el recall de fallas críticas es la métrica de homologación exigida por ley."
  },
  {
    id: 16,
    title: "Matriz de Confusión 3×3",
    icon: "🧩",
    shortSummary: "La tabla de la verdad: muestra qué clase se acertó y dónde ocurrió cada confusión.",
    concepts: ["Diagonal de aciertos", "Falso Negativo Crítico", "Falsa Alarma Segura"],
    linesSimple: [
      { code: "confusion_matrix(y_true, y_pred)", simple: "Filas = lo que el techo era en la realidad; Columnas = lo que la IA dijo." },
      { code: "Celda [Real=2, Pred=0]", simple: "El error mortal: techo aplastado que la IA dijo que estaba sano." },
      { code: "Celda [Real=0, Pred=2]", simple: "Falsa alarma: techo sano retenido por precaución (seguro pero demora)." }
    ],
    linesTechnical: [
      "Matriz de contingencia 3x3 normalizada por fila para visualizar directamente el recall por clase.",
      "Auditoría de asimetría de costos operacionales marítimos."
    ],
    mathFormulas: [
      { formula: "C_ij = #{y = i, ŷ = j}", explanation: "Conteo exacto de casos por cada combinación de predicción y verdad." }
    ],
    realWorldUse: "Auditoría de cumplimiento del convenio SOLAS (Safety of Life at Sea) para estiba segura de buques portacontenedores."
  },
  {
    id: 17,
    title: "Grad-CAM e Interpretabilidad",
    icon: "🔥",
    shortSummary: "La linterna térmica que espía la mente de la IA para verificar que mire la abolladura y no el mar.",
    concepts: ["Hooks", "Gradiente en layer4", "Promedio espacial", "Mapa térmico"],
    linesSimple: [
      { code: "layer4[-1].register_forward_hook()", simple: "Micrófono espía que graba las características visuales antes de que se borren." },
      { code: "logits[0, clase].backward()", simple: "Preguntar: ¿qué píxeles empujaron con más fuerza hacia esta decisión?" },
      { code: "weights = gradients.mean(dim=(2,3))", simple: "Promediar la importancia de cada uno de los 512 mapas de visión." },
      { code: "cam = F.relu(...) e interpolar", simple: "Quedarse con lo que aporta en positivo y agrandar suavemente sobre la foto." }
    ],
    linesTechnical: [
      "Intercepta mapas de activación A ∈ ℝ^(512×7×7) y retropropaga el puntaje de clase hacia ellos.",
      "Aplica Global Average Pooling sobre gradientes y combina linealmente con filtrado ReLU.",
      "Interpola bilinealmente a 224x224 para superponer el mapa térmico de calor."
    ],
    mathFormulas: [
      { formula: "α_k^c = (1/49) ∑∑ (∂y^c / ∂A_{ij}^k)", explanation: "Peso de relevancia para el canal k en la clase c." },
      { formula: "L_CAM = ReLU( ∑ α_k A^k )", explanation: "Mapa de activación ponderado por gradiente." }
    ],
    realWorldUse: "Permite a los inspectores de patio verificar que la red detectó la abolladura real y no se distrajo con gaviotas o el agua del mar (evita Shortcut Learning)."
  },
  {
    id: 18,
    title: "Liberar Hooks y Triage Industrial",
    icon: "🧹",
    shortSummary: "Retirar los micrófonos espías para no gastar memoria y conectar la IA con los inspectores humanos.",
    concepts: ["hook.remove()", "Human-in-the-Loop", "Triage de seguridad", "Gestión de memoria"],
    linesSimple: [
      { code: "forward_handle.remove()", simple: "Desconectar la cámara espía para dejar la red limpia y rápida." },
      { code: "if p_dano >= 0.40: RECHAZO", simple: "Con un 40% de sospecha ya frenamos el contenedor preventivamente." },
      { code: "else: REVISION_HUMANA", simple: "Si la IA duda, le manda la foto con mapa térmico al tablet del inspector en el muelle." }
    ],
    linesTechnical: [
      "Libera los handles de PyTorch para prevenir fugas de memoria y llamadas recursivas en inferencia futura.",
      "Algoritmo de triage con calibración de umbrales asimétricos y supervisión humana activa."
    ],
    mathFormulas: [
      { formula: "Umbral = 0.40 < 0.50", explanation: "Desplaza el punto de corte en la curva ROC para maximizar el recall de seguridad." }
    ],
    realWorldUse: "Sistemas mixtos de IA + Humanos en puertos de Róterdam, Singapur o San Antonio: la máquina procesa miles de fotos por hora y el humano decide en los casos dudosos."
  }
];
