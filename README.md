# 🧠 Wizard SaaS Pólizas de Seguros - Angular

¡Bienvenido al repositorio del **Wizard SaaS para la gestión de pólizas de seguros**! 

Este proyecto es una aplicación web de un solo flujo (Wizard de 7 pasos) desarrollada en **Angular 18**, diseñada para digitalizar, extraer datos con Inteligencia Artificial y gestionar pólizas de seguros de manera intuitiva y con un diseño Premium y minimalista (SaaS Style).

---

## 🎯 Objetivo del Proyecto

Transformar el proceso manual de captura de pólizas en una experiencia automatizada y fluida. La aplicación guía al agente de seguros a través de:
1.  **Carga** de un documento PDF o imagen de la póliza.
2.  **Extracción de datos** (Cliente, Vigencia, Importes) mediante IA (Gemini).
3.  **Configuración** de comisiones y notificaciones automatizadas.
4.  **Generación** de un dashboard visual con la información extraída.

---

## 🏗️ Arquitectura y Flujo (Los 7 Pasos)

El proyecto está estructurado como un Wizard lineal. Cada paso es un componente Angular independiente gestionado por un componente padre (`WizardComponent`).

1.  **Paso 1: Importar Póliza** (`step1-importar`): Interfaz "Dropzone" para subir PDFs o imágenes. Pantallas de carga tipo "Scanner" simulando la lectura de IA.
2.  **Paso 2: IA Extrae Información** (`step2-extraccion`): Animación de procesamiento y muestra de los datos base extraídos.
3.  **Paso 3: Completar Datos Faltantes** (`step3-completar`): Formulario reactivo estricto (con máscara de teléfono) para email y celular del cliente, y un slider para definir el porcentaje de comisión.
4.  **Paso 4: Gestión de Recibos** (`step4-recibos`): Listado de recibos extraídos de la póliza con un menú Kabob (`mat-menu`) para acciones rápidas y paneles de gestión de siniestros.
5.  **Paso 5: Entrega y Renovación** (`step5-poliza`): Previsualización del documento procesado y opciones interactivas para el envío de la póliza al cliente.
6.  **Paso 6: Notificaciones Automáticas** (`step6-notificaciones`): Grid interactivo para activar/desactivar recordatorios modulares (Cobranza, Renovaciones, etc.).
7.  **Paso 7: Dashboard Final** (`step7-estadisticas`): Panel de KPIs y checklist de éxito.

---

## 🛠️ Stack Tecnológico y Estándares

-   **Framework Core:** Angular 18 (TypeScript).
-   **UI / Componentes:** HTML5, Bootstrap 5 (Layout), Angular Material (Componentes específicos como Menús e Iconos).
-   **Estilos:** SCSS puro. **Manejado con un enfoque de Design Tokens (Local Variables).** 
    -   *Regla estricta:* Toda variación de color, botón o tarjeta usa los *mixins* definidos en `src/app/core/styles/_figma-mixins.scss` importados en `src/styles.scss`. No se utiliza TailwindCSS.
-   **Gestión de Estado:** Servicio Inyectable (`WizardService`) utilizando **Signals (`signal`, `computed`)** para máxima reactividad sin depender exhaustivamente de RxJS explícito.
-   **Persistencia:** `localStorage` manejado en el `WizardService` para prevenir pérdida de datos si el usuario recarga la página.
-   **IA:** Integración con la API de Gemini (gestionada por `GeminiExtractionService`), con simulación de fallback (Modo Ahorro) en caso de errores.

---

## 📁 Estructura Principal de Carpetas

\`\`\`text
src/
└── app/
    ├── core/
    │   ├── models/           # Interfaces estrictas (WizardState, Client, Policy, etc.)
    │   ├── services/         # Lógica de negocio pura (WizardService, GeminiExtraction, AuditService)
    │   ├── styles/           # Archivos base de estilo (_figma-mixins.scss)
    │   └── utils/            # Funciones puras de ayuda (formatters.ts)
    └── estructura/
        └── operacion/
            └── wizard/       # Módulo principal del Wizard
                ├── wizard.component.ts     # Componente orquestador (Stepper)
                └── steps/    # Subcarpetas con los componentes step1 al step7
\`\`\`

---

## 💻 Guía de Inicio y Comandos Básicos

Clona el repositorio e instala las dependencias.

### Instalación
\`\`\`bash
npm install
\`\`\`

### Servidor de Desarrollo
Para levantar el proyecto en tu entorno local y ver los cambios en tiempo real:
\`\`\`bash
npm run start
# o alternativamente:
ng serve
\`\`\`
> La aplicación estará disponible por defecto en `http://localhost:4200/`

### Compilación para Producción (Build)
Para generar los archivos estáticos optimizados listos para su despliegue:
\`\`\`bash
npm run build
# o alternativamente:
ng build
\`\`\`

### Ejecución de Pruebas Unitarias
\`\`\`bash
npm run test
\`\`\`

---

## 🧠 Características Avanzadas / Robustez Implementada

Para los desarrolladores que toquen el código base, tener en cuenta estas características de grado SaaS:

*   **Persistencia Activa:** El estado se guarda automáticamente en `localStorage`. Para reestablecerlo, existe el método `resetState()` en el servicio.
*   **Validaciones Reactivas:** El `Paso 3` contiene validaciones estrictas (`Validators.pattern`). El botón de continuar se inhabilita nativamente ante formatos inválidos.
*   **Gestión de Logs (`AuditService`):** Las extracciones exitosas y los fallos se registran discretamente mediante este servicio para auditorías sin contaminar la UI.
*   **Mixins de Diseño:** Si necesitas crear un nuevo botón o tarjeta, revisa `_figma-mixins.scss`. **No** apliques estilos en línea para recrear sombras complejas o botones; usa `@include figma-card-hover`, `@include figma-button(...)`, etc.

¡Feliz código! 🚀
