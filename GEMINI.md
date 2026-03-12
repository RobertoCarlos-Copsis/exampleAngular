# 🧠 Project Brain: Wizard SaaS Pólizas de Seguros - Angular (GEMINI.md)

Este documento es la fuente de verdad arquitectónica y de estándares para el proyecto en Angular. Su objetivo es proporcionar a desarrolladores y agentes de IA un entendimiento rápido y claro de la estructura, flujo y reglas del sistema adaptado de React a Angular.

## 📌 Contexto del Proyecto

El proyecto es un **Wizard SaaS para la gestión de pólizas de seguros**, desarrollado íntegramente con **Angular 18**. La aplicación guía al usuario a través de un proceso estructurado para digitalizar, completar y administrar pólizas mediante inteligencia artificial.

### 🔄 Flujo de 7 Pasos (Wizard)

1. **Importar póliza**: Carga de documentos (PDF/Imágenes).
2. **IA extrae información**: Procesamiento automático de datos del cliente, póliza y recibos.
3. **Completar datos faltantes**: Formulario para añadir datos de contacto (email, teléfono, porcentaje de comisión).
4. **Gestión de recibos**: Panel de control para revisar recibos, registrar pagos y enviar recordatorios u otros mensajes por diversos canales.
5. **Entrega y renovación**: Opciones para compartir la póliza (TuPoliza Email, App móvil) y fijar recordatorios de renovación.
6. **Notificaciones automáticas**: Configuración de alertas modulares interactables para cobranza, renovaciones, siniestros y comisiones.
7. **Dashboard final**: Panel completo de estadísticas, métricas de acciones y gráficas de rendimiento.

---

## 🛠️ Stack Tecnológico

- **Core**: Angular 18
- **Componentes**: Angular Standalone Components (o basados en módulos según se defina en el setup).
- **Manejo de Estado Global**: RxJS (`BehaviorSubject`) en Servicios inyectables (ej. `WizardService`).
- **Manejo de Fechas**: `moment.js` (ya configurado en el proyecto) o el nativo `DatePipe` de Angular.
- **Visualización de Datos**: `ng2-charts` (basado en Chart.js) o implementaciones nativas equivalentes a Recharts.
- **Estilos**: Bootstrap 5 + SCSS enfocado en variables para temática SaaS Premium y utilidades de Bootstrap. Íconos de Bootstrap Icons o similares.
- **Tipado**: TypeScript estricto.

🚫 **Restricciones estrictas de Stack (NO USAR)**:
- React
- Tailwind CSS

---

## 📦 Estado Global Esperado (`WizardService`)

El estado global de la aplicación es manejado a través de un servicio inyectado a nivel de raíz (`providedIn: 'root'`) que expone observables para mantener la información transaccional y preferencias del Wizard de forma reactiva:

```typescript
export interface WizardState {
  currentStep: number; // Número del paso actual (1-7)
  policy: {
    data: any;     // Información extraída de la póliza
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  receipts: any[]; // Array de objetos de recibos: { id, prima, periodo, status, commission }
  commissionPercentage: number;
  notifications: {
    cobranza: { active: boolean };
    renovacion: { active: boolean };
    siniestros: { active: boolean };
    comisiones: { active: boolean };
    generales: { active: boolean };
  };
  logs: string[];
  statistics: any;
}
```

---

## 📐 Reglas Arquitectónicas y Estándares

1. **Separación de Responsabilidades (SoC)**:
   - Mantener una estricta separación entre Componentes (UI/Presentación) y Servicios (Lógica de Negocio, Estado Global, Llamadas HTTP).
2. **Cálculos Financieros Centralizados**:
   - Todo cálculo complejo o financiero (primas, conversiones, comisiones, impuestos) **debe** residir en funciones de utilidad en `/core/utils` o dentro de servicios específicos. Nunca en el componente.
3. **Inmutabilidad y Reactividad**:
   - Usar RxJS para transmitir variaciones de estado. Modificar el estado a través de métodos definidos en el servicio que emitan un nuevo valor del estado (clon profundo/desestructurado).
4. **Arquitectura Modular y Escalable**:
   - Agrupar características mediante la estructura basada en responsabilidades.

---

## 📁 Estructura Base del Proyecto

A continuación, la distribución de directorios recomendada dentro de `src/app`:

```text
src/app/
├── core/
│   ├── services/        # Servicios core (ej. WizardService.ts, ApiService.ts)
│   ├── models/          # Interfaces y tipos de TypeScript
│   └── utils/           # Matemáticas puras, formateadores
├── shared/
│   ├── components/      # Componentes reutilizables (Botones, Tarjetas, Modales)
│   └── pipes/           # Transformadores de datos visuales
├── features/
│   └── wizard/
│       ├── wizard.component.ts      # Contenedor padre
│       └── steps/                   # Componentes para los paso 1 al 7
```

---

## 🚀 Ejecución del Proyecto

### Comandos principales

1. **Levantar servidor de desarrollo (CLI)**:
   ```bash
   ng serve
   ```
   > 🔴 *La aplicación estará disponible localmente por defecto en `http://localhost:4200`*

2. **Construir para producción (Build)**:
   ```bash
   ng build
   ```
