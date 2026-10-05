export interface TechnicalConcept {
  id: string;
  term: string;
  originalQuery: string; // What the user asked
  category: 'parametros' | 'arquitectura' | 'entrenamiento' | 'metricas' | 'gradcam';
  shortDefinition: string;
  fullExplanation: string;
  codeSnippet?: string;
  analogia: string;
  consecuenciaOperativa: string;
}

export const TECHNICAL_GLOSSARY: TechnicalConcept[] = [
  {
    id: 'seed_42',
    term: 'Semilla Aleatoria (SEED = 42) y fijar_semillas()',
    originalQuery: 'porque la semilla 42',
    category: 'parametros',
    shortDefinition: 'Fija el punto de partida de los generadores pseudoaleatorios para garantizar reproducibilidad exacta.',
    fullExplanation: `Las computadoras no generan números verdaderamente aleatorios, sino secuencias pseudoaleatorias generadas por fórmulas matemáticas deterministas. Si no fijas una semilla:
- Cada vez que ejecutes el notebook, la partición de datos (random_split) cambiará.
- Los pesos iniciales de la nueva capa fc serán distintos.
- El orden de los lotes (DataLoader shuffle) será diferente.
- Las transformaciones de Data Augmentation cambiarán.

¿Por qué el número 42?
Es una convención y homenaje cultural en ciencias de la computación al libro "Guía del autoestopista galáctico" (donde 42 es 'el sentido de la vida, el universo y todo lo demás'). Matemáticamente, cualquier entero funciona exactamente igual (42, 123, 7). Lo crítico no es el número, sino fijarlo en todos los subsistemas:
1. os.environ['PYTHONHASHSEED'] = str(seed)
2. random.seed(seed)
3. np.random.seed(seed)
4. torch.manual_seed(seed) y torch.cuda.manual_seed_all(seed)
5. torch.backends.cudnn.deterministic = True y benchmark = False`,
    codeSnippet: `def fijar_semillas(seed=42):
    os.environ['PYTHONHASHSEED'] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False`,
    analogia: 'Es como barajar un mazo de cartas usando exactamente el mismo patrón de barajado: cada vez que repartas, cada jugador recibirá exactamente las mismas cartas.',
    consecuenciaOperativa: 'Permite que el profesor, evaluador o auditor obtenga exactamente los mismos decimales de exactitud y la misma matriz de confusión que tú.',
  },
  {
    id: 'tam_224',
    term: 'Resolución Espacial TAM = 224 (224×224 píxeles)',
    originalQuery: 'tam 224',
    category: 'parametros',
    shortDefinition: 'Dimensión canónica estándar de entrada para redes convolucionales preentrenadas en ImageNet.',
    fullExplanation: `ResNet-18 fue entrenada originalmente por Microsoft sobre el dataset ImageNet (1.2 millones de fotos) usando imágenes redimensionadas a 224×224 píxeles.

Razones matemáticas y arquitectónicas:
1. Reducción espacial progresiva: ResNet-18 aplica 5 etapas de reducción a la mitad (stride=2 o MaxPool):
   224 → 112 → 56 → 28 → 14 → 7.
   Al llegar a la capa final (layer4), el mapa de características mide exactamente 7×7 píxeles con 512 canales [512, 7, 7].
   7 es un número entero impar perfecto con un píxel central natural (3, 3).
2. Si usaras un tamaño no estándar (ej. 200×200), las dimensiones intermedias darían números fraccionarios o bordes recortados en los kernels de convolución.
3. Compatibilidad de pesos preentrenados: Al usar 224×224, el campo receptivo de los filtros convolucionales coincide exactamente con la escala para la cual fueron optimizados.`,
    codeSnippet: `TAM = 224 # Tensor de entrada: [Batch, 3, 224, 224]
# Tras layer4 de ResNet18: [Batch, 512, 7, 7]
# Tras AvgPool: [Batch, 512, 1, 1]`,
    analogia: 'Es como el tamaño de una hoja de papel estándar (A4 o Carta): toda la impresora y sus bandejas están milimétricamente diseñadas para encajar con esa medida.',
    consecuenciaOperativa: 'Garantiza máxima velocidad de procesamiento en GPU y evita tener que reentrenar o interpolar los filtros espaciales preentrenados.',
  },
  {
    id: 'normalizacion_imagenet',
    term: 'Normalización: Min-Max vs Z-Score de ImageNet',
    originalQuery: 'normalización min max',
    category: 'parametros',
    shortDefinition: 'Escalamiento a [0, 1] seguido de estandarización Z-score con la media y desviación de ImageNet.',
    fullExplanation: `En el pipeline de PyTorch ocurren DOS etapas de normalización sucesivas:

1. Escalamiento Min-Max [0, 1]:
   Las imágenes en bruto son enteros uint8 en rango [0, 255].
   v2.ToDtype(torch.float32, scale=True) divide cada píxel entre 255.0:
   x_scaled = x / 255.0 ∈ [0.0, 1.0].

2. Estandarización Z-Score de ImageNet (Media y Varianza):
   v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
   Aplica la fórmula matemática por cada canal RGB:
   z = (x - media) / desviacion_estandar.

¿Por qué estos valores específicos [0.485, 0.456, 0.406]?
Son la media y desviación típica exacta de los millones de píxeles del dataset ImageNet en 2012. Como ResNet18 tiene sus 11 millones de pesos congelados calibrados para recibir tensores con media 0 y varianza 1 en ese rango, si no normalizas con esos números, las activaciones de las neuronas se saturarían o se apagarían.`,
    codeSnippet: `transform_eval = v2.Compose([
    v2.ToDtype(torch.float32, scale=True), # Min-Max a [0, 1]
    v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # Z-Score
])`,
    analogia: 'Si un termómetro fue calibrado en grados Celsius, no puedes introducirle valores en Fahrenheit sin convertir la escala primero, o la lectura no tendrá ningún sentido.',
    consecuenciaOperativa: 'Permite que el modelo extraiga texturas de óxido y bordes metálicos desde la primera capa convolucional sin desviaciones.',
  },
  {
    id: 'batch_32',
    term: 'Tamaño de Lote (Batch Size = 32) y por qué no otro',
    originalQuery: 'porque el bash 32 y no otro numero',
    category: 'parametros',
    shortDefinition: 'Cantidad de imágenes que se procesan en paralelo antes de actualizar los pesos de la red.',
    fullExplanation: `¿Por qué 32 y no 1, 10 o 512?

1. Alineación con la Arquitectura de Hardware de NVIDIA (CUDA Warps):
   Las GPUs ejecutan hilos en grupos de 32 llamados "Warps". Procesar múltiplos de 32 (32, 64, 128) satura los núcleos tensoriales al 100% sin dejar hilos ociosos.
2. Compromiso entre Ruido Estocástico y Estabilidad:
   - Batch = 1 (SGD Puro): El gradiente es sumamente ruidoso y la GPU pasa la mayor parte del tiempo esperando transferencias de memoria.
   - Batch = 1000 (Batch Gradient Descent): El gradiente es exacto pero pierde la propiedad regularizadora del ruido estocástico; tiende a atascarse en mínimos locales planos y sobreajustar.
   - Batch = 32: Es el "punto dulce" empírico recomendado por Yann LeCun y el estándar de la industria; ofrece excelente velocidad de convergencia y buena generalización.
3. Límites de Memoria VRAM: En Google Colab con GPU T4 (15 GB de VRAM), 32 tensores de 3×224×224 caben holgadamente sin riesgo de error Out Of Memory (OOM).`,
    codeSnippet: `BATCH_SIZE = 32
train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)`,
    analogia: 'Es como cocinar para 32 personas en un banquete en lugar de cocinar plato por plato (muy lento) o cocinar para todo un estadio a la vez (se quema la comida).',
    consecuenciaOperativa: 'Máxima eficiencia de cálculo en GPU T4 con gradientes estables que no oscilan caóticamente.',
  },
  {
    id: 'workers',
    term: 'Workers en DataLoader (num_workers = 2)',
    originalQuery: 'que son los worken',
    category: 'parametros',
    shortDefinition: 'Procesos paralelos de CPU que precargan y transforman los datos mientras la GPU entrena.',
    fullExplanation: `DataLoader(..., num_workers=2) especifica cuántos subprocesos de CPU se dedican a preparar las imágenes.

El cuello de botella clásico en Deep Learning:
La GPU es ultrarrápida calculando multiplicaciones de matrices. Si num_workers=0, la GPU tiene que detenerse en cada batch a esperar que la CPU lea las imágenes del disco, les aplique el Data Augmentation y las normalice.

Con num_workers=2:
- El Worker 1 y el Worker 2 preparan en segundo plano los lotes siguientes (prefetch).
- Cuando la GPU termina de optimizar el batch actual, el siguiente batch ya está listo en memoria RAM.
- pin_memory=True permite además transferir los tensores de la RAM a la VRAM de la GPU mediante DMA (Direct Memory Access) sin pasar por la CPU.`,
    codeSnippet: `DataLoader(train_ds, batch_size=32, num_workers=2, pin_memory=True)`,
    analogia: 'En un restaurante, los workers son los ayudantes de cocina que pelan, cortan y sazonan los ingredientes para que el chef principal (la GPU) solo tenga que cocinar sin pausas.',
    consecuenciaOperativa: 'Elimina el GPU starvation, reduciendo el tiempo de época a la mitad.',
  },
  {
    id: 'fc_capa_lineal',
    term: 'Capa Lineal Fully-Connected (modelo.fc): Dónde está y qué hace',
    originalQuery: 'la capa lineal de la fc en que parte de la red esta donde esta parado y que hace',
    category: 'arquitectura',
    shortDefinition: 'La última capa de la red; proyecta el vector abstracto de 512 características visuales en los 3 puntajes de clase.',
    fullExplanation: `¿Dónde está ubicada físicamente en ResNet-18?
Está ubicada en el extremo final absoluto de la arquitectura.
El flujo completo dentro de ResNet-18 es:
1. Entrada: Tensor de imagen [Batch, 3, 224, 224].
2. Conv1 + MaxPool: Detecta bordes básicos y colores.
3. Layer 1: Convoluciones residuales de baja resolución (64 canales).
4. Layer 2: Formas geométricas (128 canales).
5. Layer 3: Texturas complejas (256 canales).
6. Layer 4: Patrones de alto nivel como grietas y corrugaciones (512 canales de 7×7 píxeles).
7. AdaptiveAvgPool2d: Promedia espacialmente cada canal de 7×7 a 1×1 píxel. Produce un vector plano de 512 números por imagen.
8. >>> AQUÍ ESTÁ PARADA LA CAPA FC <<<

¿Qué hace?
En el modelo original de ImageNet, modelo.fc era nn.Linear(512, 1000) (clasificaba 1000 categorías: perros, gatos, autos...).
En el notebook, se sustituye por:
modelo.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(512, 3)
)

Aplica la transformación afín lineal:
z = x · W^T + b
Donde:
- x es el vector de 512 características visuales.
- W es una matriz de pesos de tamaño [3, 512] (1,536 multiplicaciones).
- b es un vector de sesgo de tamaño [3].
Resultado: 3 números llamados logits (uno para Intacto, uno para Óxido y uno para Daño Crítico).`,
    codeSnippet: `n_features = modelo.fc.in_features # 512
modelo.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(n_features, 3) # Proyecta 512 a 3 clases
)`,
    analogia: 'Es el juez final de un jurado: las capas anteriores son los peritos que recopilan 512 pistas visuales; la capa fc escucha esas 512 pistas y emite el veredicto final en 3 categorías.',
    consecuenciaOperativa: 'Adapta una red entrenada en animales y objetos cotidianos para tomar decisiones marítimas portuarias.',
  },
  {
    id: 'requires_grad',
    term: 'requires_grad = False (Congelamiento de Capas en PyTorch)',
    originalQuery: 'redycrak',
    category: 'arquitectura',
    shortDefinition: 'Bandera que desactiva el cálculo de gradientes y la actualización de pesos en el autograd.',
    fullExplanation: `En PyTorch, cada tensor de parámetros (pesos y sesgos) tiene un atributo booleano llamado requires_grad.

- requires_grad = True: PyTorch rastrea todas las operaciones matemáticas aplicadas a ese tensor en un grafo computacional acíclico dirigido (DAG) para calcular sus derivadas durante loss.backward().
- requires_grad = False: PyTorch ignora ese parámetro durante la retropropagación.

¿Por qué se congelan todas las capas del backbone?
for p in modelo.parameters():
    p.requires_grad = False

1. Disponemos de solo 1,050 imágenes de entrenamiento: Si intentáramos optimizar los 11.2 millones de parámetros de ResNet-18, la red memorizaría las imágenes píxel a píxel en 2 épocas (overfitting brutal).
2. Ahorro de VRAM y tiempo: Al no calcular gradientes para el 99.98% de la red, el entrenamiento tarda segundos en lugar de horas.
3. Solo la nueva capa modelo.fc conserva requires_grad = True.`,
    codeSnippet: `for p in modelo.parameters():
    p.requires_grad = False # Congela 11,175,000 parámetros

modelo.fc = nn.Sequential(..., nn.Linear(512, 3)) # Solo esta tiene requires_grad=True`,
    analogia: 'Es como contratar a un fotógrafo profesional premiado internacionalmente: no necesitas enseñarle a usar su cámara ni enfocar (eso ya lo sabe); solo le dices qué 3 tipos de contenedores quieres que identifique.',
    consecuenciaOperativa: 'Evita el sobreajuste y reduce los parámetros entrenables de 11.2 millones a solo 1,539.',
  },
  {
    id: 'cross_entropy',
    term: 'CrossEntropyLoss (Pérdida de Entropía Cruzada Ponderada)',
    originalQuery: 'porque usa prosprontopi y no otro',
    category: 'entrenamiento',
    shortDefinition: 'Función de pérdida estándar para clasificación multiclase mutuamente excluyente.',
    fullExplanation: `¿Por qué CrossEntropyLoss y no MSE (Error Cuadrático Medio) ni Binary CrossEntropy?

1. Naturaleza Multiclase Excluyente: Cada contenedor pertenece estrictamente a una de 3 clases (0, 1 o 2). CrossEntropyLoss modela matemáticamente una distribución de probabilidad categórica.
2. Estabilidad Numérica y Gradientes Fuertes:
   Combina internamente LogSoftmax + NLLLoss (Negative Log Likelihood) en una sola operación optimizada en C++:
   Loss = -log( e^{z_y} / sum_j e^{z_j} )
   Si usaras MSE sobre probabilidades softmax, cuando la red comete un error muy grave la derivada tiende a cero (gradiente desvanecido), haciendo que la red aprenda lentísimo. CrossEntropy produce un gradiente lineal proporcional al error.
3. Soporte Nativo de Pesos (weight=pesos_clase):
   Permite pasar directamente el vector de pesos inversos para contrarrestar el desbalance 70/20/10:
   criterio = nn.CrossEntropyLoss(weight=pesos_clase).`,
    codeSnippet: `criterio = nn.CrossEntropyLoss(weight=pesos_clase)`,
    analogia: 'Es una penalización logarítmica: si la red está 99% segura de que un contenedor roto está intacto, el castigo matemático tiende al infinito.',
    consecuenciaOperativa: 'Obliga a la red a enfocarse intensamente en aprender la clase de daño crítico a pesar de ser solo el 10% del dataset.',
  },
  {
    id: 'adam_optimizer',
    term: 'Algoritmo de Optimización Adam: Cómo Trabaja y Qué Hace',
    originalQuery: 'el agoritno adan como trabaja y que hace',
    category: 'entrenamiento',
    shortDefinition: 'Optimizador adaptativo que combina el momento de primer orden (media) y segundo orden (varianza).',
    fullExplanation: `Adam (Adaptive Moment Estimation) es el algoritmo encargado de actualizar los pesos de la red. Combina las ventajas de dos métodos clásicos: SGD con Momento y RMSprop.

¿Cómo funciona matemáticamente en cada paso t?
1. Calcula el gradiente instantáneo: g_t = ∇_W Loss.
2. Momento de 1er orden (m_t - Dirección y velocidad):
   m_t = β1 · m_{t-1} + (1 - β1) · g_t   (inercia para no oscilar en curvas estrechas).
3. Momento de 2do orden (v_t - Escala y magnitud del gradiente):
   v_t = β2 · v_{t-1} + (1 - β2) · g_t^2 (promedio móvil de las pendientes al cuadrado).
4. Corrección de sesgo para las primeras épocas:
   m̂_t = m_t / (1 - β1^t)
   v̂_t = v_t / (1 - β2^t)
5. Actualización final de cada peso W:
   W_{t+1} = W_t - (lr / (sqrt(v̂_t) + ε)) · m̂_t

Ventaja clave: Cada uno de los 1,539 parámetros tiene su propia tasa de aprendizaje adaptativa. Los pesos que reciben gradientes pequeños avanzan con pasos más grandes, y los pesos con gradientes explosivos se frenan automáticamente.`,
    codeSnippet: `optimizador = torch.optim.Adam(
    [p for p in modelo.parameters() if p.requires_grad],
    lr=0.001,
    weight_decay=1e-4
)`,
    analogia: 'Es como un ciclista que baja una colina con inercia para saltar baches pequeños (momento) y frenos inteligentes que se ajustan automáticamente según lo empinada que esté la calle (tasa adaptativa).',
    consecuenciaOperativa: 'Convergencia rápida y estable en solo 10 épocas sin necesidad de ajustar el learning rate a mano.',
  },
  {
    id: 'logits',
    term: 'Logits (Puntajes Crudos no Normalizados)',
    originalQuery: 'que es un login',
    category: 'arquitectura',
    shortDefinition: 'Los valores numéricos reales brutos que salen de la última capa lineal antes de aplicar Softmax.',
    fullExplanation: `Un logit (de "log-odds") es un número real en el intervalo (-∞, +∞) emitido directamente por la capa lineal:
logits = modelo(xb) # Tensor con forma [Batch_size, 3]

Ejemplo real de logits para una imagen:
[3.45, -1.20, 8.91]

Propiedades:
- No suman 1.0.
- Pueden ser negativos, cero o positivos.
- El valor más alto corresponde a la clase predicha más probable (argmax).

Para convertirlos en probabilidades interpretables entre 0% y 100%, se aplica la función Softmax:
P(clase i) = e^{logit_i} / sum_j e^{logit_j}
En el ejemplo:
e^8.91 domina ampliamente la suma, dando P(Daño Crítico) ≈ 99.5%.`,
    codeSnippet: `logits = modelo(xb) # Forma: [32, 3]
probabilidades = torch.softmax(logits, dim=1) # Suman 1.0 por fila`,
    analogia: 'Los logits son los votos contados en una urna; las probabilidades softmax son el porcentaje oficial que cada candidato obtuvo sobre el total.',
    consecuenciaOperativa: 'Permiten calcular pérdidas de forma numéricamente estable sin sufrir problemas de división por cero.',
  },
  {
    id: 'optimizador_concepto',
    term: 'El Optimizador: Rol General en Deep Learning',
    originalQuery: 'que es el optimizador',
    category: 'entrenamiento',
    shortDefinition: 'El motor matemático que modifica los pesos para minimizar la función de error.',
    fullExplanation: `El optimizador es el algoritmo responsable de dar el paso de actualización en los parámetros entrenables.

El ciclo de entrenamiento de PyTorch consta de 4 fases indivisibles:
1. Forward: La imagen entra, se calculan activaciones y se obtienen logits.
2. Pérdida (Loss): Se compara la predicción con la realidad para obtener un número escalar que mide qué tan mal lo hizo el modelo.
3. Backward: PyTorch calcula las derivadas parciales de la pérdida respecto a cada peso (dLoss/dW).
4. Optimizador (optimizer.step()): El optimizador lee los gradientes almacenados y altera los valores de W para que en la siguiente pasada el error sea menor.`,
    codeSnippet: `optimizador.zero_grad(set_to_none=True) # 1. Limpia gradientes viejos
perdida.backward()                      # 2. Calcula nuevos gradientes
optimizador.step()                      # 3. Modifica los pesos`,
    analogia: 'Es el timón del barco: la pérdida te dice qué tan lejos estás del puerto, el gradiente te dice hacia dónde está el norte, y el optimizador es quien gira el timón en esa dirección.',
    consecuenciaOperativa: 'Sin optimizador, los pesos nunca cambiarían y la red neuronal jamás aprendería.',
  },
  {
    id: 'backward_pass',
    term: '¿Qué hace loss.backward()? (Retropropagación)',
    originalQuery: 'qhe hace backwarak',
    category: 'entrenamiento',
    shortDefinition: 'Aplica la regla de la cadena para calcular las derivadas parciales dLoss/dW de todos los pesos.',
    fullExplanation: `loss.backward() dispara el motor de Autograd de PyTorch.

1. Parte del escalar de pérdida y recorre el grafo de operaciones hacia atrás (desde la capa fc hasta las entradas).
2. Por cada operación (suma, multiplicación matricial, dropout), aplica la regla de la cadena del cálculo diferencial:
   dLoss / dW = (dLoss / dLogits) · (dLogits / dW).
3. Deposita el valor resultante en el atributo .grad de cada parámetro que tenga requires_grad=True:
   peso.grad += gradiente_calculado.
4. Si ejecutas backward() dos veces sin hacer optimizer.zero_grad(), los gradientes se acumulan sumándose. Por eso es obligatorio limpiar los gradientes en cada batch.`,
    codeSnippet: `perdida.backward() # Rellena W.grad con los gradientes numéricos`,
    analogia: 'Es como hacer una autopsia a un fallo: examinas el resultado erróneo y vas hacia atrás etapa por etapa para determinar exactamente cuánta culpa tuvo cada engranaje individual.',
    consecuenciaOperativa: 'Proporciona la dirección matemática exacta para que el optimizador reduzca el error en el siguiente lote.',
  },
  {
    id: 'accuracy_trampa',
    term: 'Accuracy (Exactitud Global) y por qué engaña con desbalance',
    originalQuery: 'que es el acuracy',
    category: 'metricas',
    shortDefinition: 'Porcentaje de predicciones correctas sobre el total: (Aciertos / Total).',
    fullExplanation: `Accuracy = (Predicciones Correctas) / (Total de Muestras).

¿Por qué es una trampa mortal en problemas desbalanceados?
En nuestro dataset de 1,500 contenedores:
- 70% son Techo Intacto (1,050).
- 20% son Óxido (300).
- 10% son Daño Crítico (150).

Si un programador escribe un modelo "tramposo" con una sola línea de código:
def predecir_tramposo(imagen): return 0 # Siempre predice 'Intacto'

¡Ese modelo inútil obtendría un 70% de Accuracy!
Sin embargo:
- Su Recall en techos con daño crítico es 0.0%.
- Cargarías 150 contenedores con riesgo de colapso a los buques.
Por eso en auditorías industriales de visión artificial se exige Precision, Recall y Macro-F1.`,
    codeSnippet: `acc = accuracy_score(y_true, y_pred) # 96.88% en el notebook`,
    analogia: 'Es como un médico que le dice a todos sus pacientes que están perfectamente sanos: acertará en el 90% de las consultas rutinarias, pero dejará morir al 10% que tenía una enfermedad crítica.',
    consecuenciaOperativa: 'El Accuracy solo mide volumen general; no evalúa la seguridad estructural ni el costo de los errores.',
  },
  {
    id: 'deepcopy_model',
    term: 'copy.deepcopy(modelo.state_dict()) y Early Checkpoint',
    originalQuery: 'qye hace el dycopi y model',
    category: 'entrenamiento',
    shortDefinition: 'Guarda una copia exacta en RAM de los pesos del modelo cuando la pérdida de validación alcanza su mínimo.',
    fullExplanation: `Durante las 10 épocas, el modelo aprende y mejora, pero en las últimas épocas puede empezar a sobreajustar (overfitting), aumentando la pérdida de validación.

¿Por qué no basta con hacer mejor_estado = modelo.state_dict()?
En Python, los diccionarios y tensores se asignan por referencia (puntero). Si no haces deepcopy, mejor_estado apuntaría a los pesos en memoria que siguen cambiando en cada época.

copy.deepcopy:
1. Clona físicamente en memoria RAM los tensores de pesos numéricos de esa época específica.
2. Al terminar las 10 épocas, se restaura la mejor versión con:
   modelo.load_state_dict(mejor_estado).
3. Asegura que el modelo exportado a producción no sea el de la época 10 (posiblemente sobreajustado), sino el de la época con menor val_loss.`,
    codeSnippet: `if va_loss < mejor_val_loss:
    mejor_val_loss = va_loss
    mejor_estado = copy.deepcopy(modelo.state_dict())
    mejor_epoca = epoca

# Al final del entrenamiento:
modelo.load_state_dict(mejor_estado)`,
    analogia: 'Es como guardar partida en un videojuego justo antes de una zona peligrosa: si mueres más adelante, cargas el punto de guardado donde estabas en tu mejor momento.',
    consecuenciaOperativa: 'Garantiza que el modelo final conserve su máxima capacidad de generalización sobre imágenes no vistas.',
  },
  {
    id: 'analisis_curvas',
    term: 'Interpretación de las Gráficas (Train Loss vs Val Loss)',
    originalQuery: 'ecplicar los las líneas y que puedes concluir',
    category: 'entrenamiento',
    shortDefinition: 'Monitoreo de divergencias para diagnosticar subajuste, ajuste óptimo o sobreajuste.',
    fullExplanation: `En el Paso 4 se generan dos gráficos: Pérdida (Loss) y Exactitud (Accuracy) a lo largo de las 10 épocas.

Cómo leer las líneas:
1. Línea Azul (Train Loss) vs Línea Naranja (Val Loss):
   - Ambas bajan juntas de forma pronunciada en las épocas 1 a 4: El modelo está aprendiendo los patrones visuales relevantes (convergencia saludable).
   - En las épocas 6 a 10 se aplanan: La cabeza lineal ha alcanzado su capacidad óptima para 1,539 parámetros.
2. ¿Cómo detectar sobreajuste (Overfitting)?
   - Si Train Loss sigue cayendo hacia 0 pero Val Loss empieza a subir sostenidamente durante 3 épocas seguidas, el modelo está memorizando el ruido.
   - En nuestro cuaderno, la pérdida de validación se mantiene baja y estable (~0.12 - 0.15), concluyendo: "Sin señales de divergencia".
3. Brecha de Exactitud (Δacc):
   - Train Acc ≈ 97%, Val Acc ≈ 96%.
   - Una brecha menor al 3% confirma excelente capacidad de generalización.`,
    codeSnippet: `brecha = historial['train_acc'][-1] - historial['val_acc'][-1] # +1.2%
sube_val = all(historial['val_loss'][-i] > historial['val_loss'][-i-1] for i in (1,2,3))`,
    analogia: 'Train Loss es tu nota estudiando con los ejercicios del libro; Val Loss es tu nota en un simulacro de examen con ejercicios que nunca habías visto.',
    consecuenciaOperativa: 'Demuestra al comité de ingeniería que el modelo no tiene memorización espuria y está listo para pruebas de campo.',
  },
  {
    id: 'regularizadores_optimizador',
    term: '¿Optimizador y Regularizador trabajan juntos o separados?',
    originalQuery: 'el optimizador funciona con el regulizador trabajan funtos o separado',
    category: 'entrenamiento',
    shortDefinition: 'Trabajan en estrecha simbiosis: el optimizador aplica la penalización matemática dictada por el regularizador.',
    fullExplanation: `Trabajan juntos de manera coordinada en dos frentes complementarios:

1. A nivel de Arquitectura (Dropout(0.3)):
   Trabaja durante el Forward Pass. Apaga aleatoriamente el 30% de las conexiones de entrada antes de que los datos toquen los pesos. El optimizador ni siquiera se entera; simplemente recibe gradientes de las neuronas que quedaron activas.
2. A nivel del Optimizador (Weight Decay / Regularización L2):
   Trabaja directamente dentro de la fórmula de actualización de Adam:
   W = W - lr · (Gradiente + weight_decay · W)
   Aquí el optimizador y el regularizador son literalmente la misma ecuación matemática. Cada vez que Adam da un paso, reduce ligeramente la magnitud de todos los pesos (los decae hacia cero).`,
    codeSnippet: `modelo.fc = nn.Sequential(
    nn.Dropout(0.3), # Regularizador 1 (Arquitectónico)
    nn.Linear(512, 3)
)
optimizador = torch.optim.Adam(..., weight_decay=1e-4) # Regularizador 2 (en el optimizador)`,
    analogia: 'Dropout es como entrenar a un equipo de fútbol obligando a jugar sin 3 jugadores aleatorios para que nadie dependa de una sola estrella; Weight Decay es la dieta que evita que los jugadores ganen peso excesivo.',
    consecuenciaOperativa: 'Elimina el riesgo de que una sola costilla de metal o un reflejo domine la decisión del modelo.',
  },
  {
    id: 'que_es_regularizador',
    term: '¿Qué es un Regularizador en Machine Learning?',
    originalQuery: 'que es regulizador',
    category: 'entrenamiento',
    shortDefinition: 'Cualquier técnica diseñada para reducir el error de prueba (generalización) sin importar si aumenta ligeramente el error de entrenamiento.',
    fullExplanation: `Un regularizador es un mecanismo que restringe la complejidad del modelo para evitar que memorice el ruido del dataset de entrenamiento.

Técnicas de regularización aplicadas en este proyecto:
1. Congelamiento del Backbone (Feature Extraction): Restringe el espacio de hipótesis a solo 1,539 parámetros.
2. Data Augmentation: Obliga al modelo a ser invariante a rotaciones y cambios de iluminación.
3. Dropout (p=0.3): Evita la co-adaptación de neuronas.
4. Weight Decay (L2 = 1e-4): Penaliza coeficientes numéricos gigantescos.
5. Early Stopping / Checkpointing: Frena el entrenamiento antes de que empiece la memorización.`,
    codeSnippet: `# Ejemplo de regularización L2 añadida a la función de pérdida:
Loss_total = CrossEntropyLoss + (λ / 2) * ||W||^2`,
    analogia: 'Es como ponerle barandillas a una escalera: limita un poco tu libertad de movimiento, pero evita que te caigas por el precipicio del sobreajuste.',
    consecuenciaOperativa: 'Permite que un modelo entrenado en 1,050 imágenes funcione de manera confiable en contenedores futuros que nunca vio.',
  },
  {
    id: 'precision_concepto',
    term: 'Precisión (Precision): Calidad de las Alarmas',
    originalQuery: 'que es la preciciom',
    category: 'metricas',
    shortDefinition: 'De todos los contenedores que el modelo clasificó como clase C, ¿cuántos realmente lo eran?',
    fullExplanation: `Precision = Verdaderos Positivos / (Verdaderos Positivos + Falsos Positivos)
Precision_c = TP_c / (TP_c + FP_c)

Ejemplo práctico en la Clase 2 (Daño Crítico):
- Supongamos que el modelo emite 25 alarmas diciendo "Contenedor con daño estructural crítico".
- Los inspectores humanos van a revisar esos 25 contenedores.
- Resulta que 23 realmente tenían abolladuras graves y 2 estaban sanos (falsas alarmas).
- Precision = 23 / 25 = 92.0%.

¿Qué significa una baja precisión?
Significa que el modelo es "asustadizo" o "alarmista": genera muchas falsas alarmas, haciendo perder tiempo y dinero al personal de patio.`,
    codeSnippet: `prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=[0,1,2])`,
    analogia: 'Es la credibilidad del pastor que grita "¡viene el lobo!": si cada vez que grita realmente hay un lobo, su precisión es del 100%; si grita 10 veces y solo hay lobo 1 vez, su precisión es del 10%.',
    consecuenciaOperativa: 'Una alta precisión evita retenciones innecesarias de contenedores sanos en los patios de transferencia.',
  },
  {
    id: 'recall_concepto',
    term: 'Recall (Sensibilidad o Cobertura): Detección de Defectos',
    originalQuery: 'que es el recall en dano critico',
    category: 'metricas',
    shortDefinition: 'De todos los contenedores que REALMENTE tenían daño crítico, ¿cuántos logró detectar el modelo?',
    fullExplanation: `Recall = Verdaderos Positivos / (Verdaderos Positivos + Falsos Negativos)
Recall_c = TP_c / (TP_c + FN_c)

¡Esta es la métrica de vida o muerte en AeroCargo Inspect!
Supongamos que en el puerto hay 22 contenedores con abolladuras estructurales graves:
- Si el modelo detecta 21 y se le escapa 1 (falso negativo):
  Recall = 21 / 22 = 95.45%.
- Ese único contenedor que no detectó se aprueba para carga, se estiba bajo 150 toneladas de otros contenedores y puede colapsar en el barco.

Por eso en aplicaciones de seguridad estructural o diagnósticos médicos (cáncer), se prefiere un Recall del 99% aunque la Precision baje al 85%.`,
    codeSnippet: `# En el notebook, el recall de la clase 2 alcanzó el 95.5% (21 de 22 detectados):
print(f'Recall Daño Crítico: {rec[2]:.1%}')`,
    analogia: 'Es un detector de metales en un aeropuerto: quieres que detecte el 100% de las armas (Recall=100%), aunque a veces suene por culpa de una hebilla de cinturón (menor precisión).',
    consecuenciaOperativa: 'Garantiza que ningún contenedor con daño estructural pase desapercibido hacia la grúa pórtico.',
  },
  {
    id: 'f1_score',
    term: 'F1-Score: Media Armónica entre Precision y Recall',
    originalQuery: 'que es el f1 score',
    category: 'metricas',
    shortDefinition: 'Promedio armónico balanceado entre la precisión y la exhaustividad.',
    fullExplanation: `F1 = 2 · (Precision · Recall) / (Precision + Recall)

¿Por qué se usa la media armónica y no el promedio aritmético simple?
Porque la media armónica castiga severamente a los modelos desbalanceados.
Ejemplo:
- Modelo A: Precision = 100%, Recall = 0% (modelo trivial que solo predijo 1 caso fácil).
  - Promedio aritmético simple: (100 + 0) / 2 = 50% (parece aceptable, pero es un engaño).
  - Media armónica F1: 2 · (1 · 0) / (1 + 0) = 0.0% (revela el fracaso absoluto del modelo).

Un F1 alto (ej. 0.96) garantiza matemáticamente que el sistema tiene tanto pocas falsas alarmas como casi cero defectos pasados por alto.`,
    codeSnippet: `f1_macro = f1_score(y_true, y_pred, average='macro') # 0.962 en el notebook`,
    analogia: 'Es como la nota final de un estudiante en un curso teórico-práctico: si sacas un 7 en teoría pero un 1 en la práctica, no puedes promediar; repruebas el curso.',
    consecuenciaOperativa: 'Proporciona una sola métrica rigurosa e incorruptible para certificar el modelo.',
  },
  {
    id: 'macro_average',
    term: 'Macro Average (Macro Promedio): Equidad entre Clases',
    originalQuery: 'macro aberach',
    category: 'metricas',
    shortDefinition: 'Promedia las métricas de las 3 clases dándoles exactamente el mismo peso (1/3 cada una).',
    fullExplanation: `Existen dos formas principales de promediar métricas en problemas multiclase:

1. Weighted Average (Promedio Ponderado por Soporte):
   Pondera cada clase según cuántas muestras tiene:
   F1_weighted = 0.70 · F1_0 + 0.20 · F1_1 + 0.10 · F1_2
   Problema: Como la clase 0 representa el 70%, domina el promedio. Si el modelo falla por completo en daño crítico (F1_2 = 0), el weighted F1 aún dará un engañoso 88%.

2. Macro Average (Macro Promedio NO Ponderado):
   F1_macro = (F1_clase0 + F1_clase1 + F1_clase2) / 3
   Trata a la clase minoritaria (10% de daño estructural) con el MISMO respeto e importancia que a la clase mayoritaria (70% intacto). Si el modelo ignora el daño crítico, el Macro F1 se desploma inmediatamente.`,
    codeSnippet: `p_mac, r_mac, f_mac, _ = precision_recall_fscore_support(y_true, y_pred, average='macro')`,
    analogia: 'Es como una democracia donde cada estado tiene un voto en el senado sin importar si tiene 1 millón o 30 millones de habitantes: nadie queda invisibilizado por el tamaño de la mayoría.',
    consecuenciaOperativa: 'Es la exigencia estándar de la rúbrica (Indicador 3.1) para validar problemas con desbalance severo.',
  },
  {
    id: 'matriz_confusion',
    term: 'Matriz de Confusión 3×3 y su Lectura Operacional',
    originalQuery: 'que significa la matrix de confucion',
    category: 'metricas',
    shortDefinition: 'Tabla de doble entrada donde las filas son la realidad y las columnas la predicción de la IA.',
    fullExplanation: `La matriz de confusión 3×3 desglosa los 225 casos de prueba cruzando Realidad vs Predicción:

Filas = Condición Real del Techo
Columnas = Lo que el Modelo Predijo

Zonas Clave:
1. La Diagonal Principal (Aciertos):
   - [0, 0]: Intacto predicho como Intacto (Verdadero Negativo) → Contenedor embarcado.
   - [1, 1]: Óxido predicho como Óxido (Acierto Preventivo) → Se agenda repintado.
   - [2, 2]: Daño predicho como Daño (Éxito de Seguridad) → Rechazado en muelle.
2. Cuadrante Rojo Catastrófico [Fila 2, Columna 0]:
   - Real = Daño Crítico, pero Predicho = Techo Intacto (Falso Negativo).
   - El barco zarpa con un contenedor comprometido bajo toneladas de carga.
3. Cuadrantes de Costo Menor [Fila 0, Columnas 1 y 2]:
   - Techo sano retenido temporalmente por falsa alarma. Se soluciona con inspección visual humana.`,
    codeSnippet: `cm = confusion_matrix(y_true, y_pred, labels=[0, 1, 2])
# Normalizada por fila da directamente el recall de cada clase en la diagonal`,
    analogia: 'Es la radiografía completa del comportamiento del modelo: no solo te dice cuántos aciertos tuviste, sino exactamente con qué se equivocó y en qué dirección.',
    consecuenciaOperativa: 'Permite auditar el cumplimiento de normativas marítimas internacionales de seguridad de carga (SOLAS / IMO).',
  },
  {
    id: 'grad_cam_concepto',
    term: 'Grad-CAM (Gradient-weighted Class Activation Mapping)',
    originalQuery: 'que es el grad cran',
    category: 'gradcam',
    shortDefinition: 'Técnica de visión artificial que produce mapas de calor para explicar visualmente en qué píxeles se basó la CNN.',
    fullExplanation: `Grad-CAM convierte una red neuronal "caja negra" en un sistema transparente y explicable.

¿Cómo funciona el algoritmo en 4 pasos matemáticos?
1. Se extrae el mapa de características convolucional A de la última capa convolucional de ResNet-18 (layer4[-1]), de tamaño [512 canales, 7×7 píxeles].
2. Se retropropaga el gradiente del puntaje (logit) de la clase objetivo y^c respecto a ese mapa:
   grad = ∂y^c / ∂A^k.
3. Se calcula la importancia alfa de cada canal haciendo un promedio espacial (Global Average Pooling):
   α_k^c = (1 / 49) · ∑_i ∑_j (∂y^c / ∂A_{i,j}^k).
4. Se combinan linealmente los 512 mapas ponderados por sus alfas y se filtra con ReLU:
   L_{Grad-CAM} = ReLU( ∑_k α_k^c · A^k ).

La función ReLU es fundamental: elimina todas las activaciones que desfavorecen a la clase y se queda solo con las zonas que aumentaron la probabilidad del defecto.`,
    codeSnippet: `pesos = self.gradientes.mean(dim=(2, 3), keepdim=True)
cam = F.relu((pesos * self.activaciones).sum(dim=1, keepdim=True))`,
    analogia: 'Es como una linterna térmica forense: ilumina en rojo brillante exactamente las huellas o fracturas metálicas que hicieron que el modelo concluyera que el contenedor está roto.',
    consecuenciaOperativa: 'Permite a los inspectores de patio verificar que la red miró la abolladura real y no el agua del mar.',
  },
  {
    id: 'media_gradiente',
    term: '¿Para qué se calcula la Media Espacial del Gradiente en Grad-CAM?',
    originalQuery: 'para que calcula la media del gradiente',
    category: 'gradcam',
    shortDefinition: 'Realiza Global Average Pooling sobre los gradientes para obtener un único escalar de importancia por cada canal.',
    fullExplanation: `En layer4 de ResNet-18 hay 512 canales convolucionales distintos. Cada canal se especializa en un patrón (ej. canal 12 detecta costillas curvas, canal 84 detecta cambios de brillo, canal 310 detecta texturas rugosas de óxido).

Cuando calculas ∂y^c / ∂A^k, obtienes una matriz de gradientes de 7×7 para el canal k.
¿Cómo sabes qué tan importante es ese canal completo para la decisión?
Calculas el promedio espacial de esos 49 números:
α_k = (1 / 49) · ∑_{i=1}^7 ∑_{j=1}^7 (∂y^c / ∂A_{i,j}^k)

- Si α_k es un número positivo alto: Ese filtro convolucional fue clave para detectar el daño estructural.
- Si α_k es cero o negativo: Ese canal no aportó nada a la clase o incluso apuntaba a otra categoría.
Ese número α_k se convierte en el multiplicador de ponderación de ese canal en el mapa de calor final.`,
    codeSnippet: `pesos = self.gradientes.mean(dim=(2, 3), keepdim=True) # [1, 512, 1, 1]`,
    analogia: 'Es como calificar la actuación de un departamento de una empresa con una nota promedio: promedias el desempeño de todos sus empleados para saber cuánto bono de productividad asignarle a ese equipo.',
    consecuenciaOperativa: 'Sintetiza millones de operaciones tensoriales en un vector de 512 pesos de relevancia visual.',
  },
  {
    id: 'interpolacion_gradcam',
    term: '¿Por qué se hace una Interpolación Bilineal en Grad-CAM?',
    originalQuery: 'poruqe hace un interpolación',
    category: 'gradcam',
    shortDefinition: 'Agranda el mapa de activación de 7×7 píxeles al tamaño original de la imagen (224×224 píxeles).',
    fullExplanation: `En la arquitectura ResNet-18, a medida que la imagen avanza por las capas convolucionales, su resolución espacial se reduce progresivamente para ganar campo receptivo:
224×224 → 112×112 → 56×56 → 28×28 → 14×14 → 7×7.

El mapa resultante de Grad-CAM al salir de layer4 mide solo 7×7 píxeles (una cuadrícula diminuta de 49 celdas).
Si intentaras superponer una cuadrícula de 7×7 sobre una foto de 224×224, verías bloques gigantescos y borrosos que no permitirían ubicar el tornillo o grieta exactos.

Por eso se usa interpolación bilineal:
cam = F.interpolate(cam, size=(224, 224), mode='bilinear', align_corners=False)
La interpolación bilineal calcula un promedio ponderado suave entre los 4 píxeles vecinos más cercanos, creando un degradado térmico continuo de 224×224 que encaja píxel por píxel sobre la imagen aérea del dron.`,
    codeSnippet: `cam = F.interpolate(cam, size=(TAM, TAM), mode='bilinear', align_corners=False)[0, 0]`,
    analogia: 'Es como proyectar una diapositiva pequeña sobre una pantalla de cine gigante: utilizas una lente óptica de aumento para que la imagen cubra todo el lienzo de proyección sin bordes toscos.',
    consecuenciaOperativa: 'Permite al operador humano ver con precisión milimétrica sobre qué costilla del techo se ubica la falla estructural.',
  },
  {
    id: 'pytorch_hooks',
    term: '¿Qué son los Hooks en PyTorch? (register_forward_hook)',
    originalQuery: 'que son hooks',
    category: 'gradcam',
    shortDefinition: 'Funciones callback espía que interceptan y guardan datos intermedios dentro del grafo de la red.',
    fullExplanation: `Normalmente, cuando ejecutas modelo(x), PyTorch descarta todas las activaciones intermedias de las capas ocultas para ahorrar memoria RAM en la GPU; solo te devuelve el resultado final (los logits).

¿Cómo podemos extraer los mapas de layer4 sin romper ni reescribir toda la clase ResNet18 de torchvision?
Usando Hooks ("ganchos").

Un Hook es una función oyente que se engancha a un módulo específico:
1. Forward Hook (register_forward_hook):
   Se dispara automáticamente durante el forward pass cuando los datos atraviesan layer4[-1]. Toma una copia de salida y la guarda en self.activaciones.
2. Tensor Hook (register_hook):
   Se engancha al tensor de activación y se dispara durante el backward pass cuando los gradientes regresan, guardándolos en self.gradientes.
3. hook.remove():
   Al terminar, se desconecta el gancho para no generar fugas de memoria.`,
    codeSnippet: `class GradCAM:
    def __init__(self, modelo, capa_objetivo):
        self._h = capa_objetivo.register_forward_hook(self._guardar)
    def _guardar(self, modulo, entrada, salida):
        self.activaciones = salida.detach()
        salida.register_hook(lambda g: setattr(self, 'gradientes', g.detach()))`,
    analogia: 'Es como instalar un micrófono espía en una tubería: el agua sigue fluyendo normalmente a su destino sin detenerse, pero el micrófono registra el sonido exacto que pasó por esa sección.',
    consecuenciaOperativa: 'Permite inspeccionar las entrañas de cualquier modelo preentrenado de PyTorch con elegancia y sin modificar su código fuente.',
  },
  {
    id: 'weight_decay',
    term: 'Weight Decay: Técnica de Regularización L2',
    originalQuery: 'que es web de kay es una técnica de que regularizador',
    category: 'entrenamiento',
    shortDefinition: 'Es la implementación directa de la Regularización L2 en optimizadores estocásticos.',
    fullExplanation: `Weight Decay ("decaimiento de pesos") es una técnica de regularización fundamental.

¿A qué tipo de regularizador pertenece?
Es la forma práctica de la Regularización L2 (también conocida como Tikhonov Regularization o Ridge Penalty).

¿Cómo funciona matemáticamente?
Añade a la función de pérdida un término proporcional a la norma euclidiana al cuadrado de todos los pesos entrenables:
Loss_con_L2 = Loss_original + (λ / 2) · ∑ W_i^2

Al calcular la derivada para el optimizador:
∂Loss_con_L2 / ∂W = ∂Loss_original / ∂W + λ · W

En cada paso de actualización:
W_{nuevo} = W_{viejo} - lr · ∇Loss - (lr · λ) · W_{viejo}
W_{nuevo} = (1 - lr · λ) · W_{viejo} - lr · ∇Loss

Observa el término (1 - lr · λ):
Como (1 - lr · λ) es un número ligeramente menor a 1 (ej. 0.9999), en cada iteración el peso se encoge (decae) automáticamente hacia cero.
¿Por qué ayuda?
Evita que la red desarrolle pesos gigantescos que reaccionen exageradamente a pequeñas variaciones de píxeles o ruido en la imagen. Obliga a que la función aprendida sea suave y generalice bien.`,
    codeSnippet: `optimizador = torch.optim.Adam(..., weight_decay=1e-4) # λ = 0.0001`,
    analogia: 'Es como una podadora de césped continua: cada vez que una rama de un peso intenta crecer demasiado alto y deformar el árbol, el weight decay la recorta suavemente.',
    consecuenciaOperativa: 'Previene la inestabilidad numérica y el sobreajuste de la capa clasificadora lineal.',
  },
];
