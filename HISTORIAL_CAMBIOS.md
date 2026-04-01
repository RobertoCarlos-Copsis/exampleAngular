# 📝 Historial de Cambios - Wizard SaaS Pólizas de Seguros

Este documento detalla todas las modificaciones, mejoras y características implementadas en el proyecto **importador-qcrm/qcrm** (Angular 18), desde la migración inicial hasta el estado actual.

---

## 🚀 Migración y Arquitectura Core

### 1. Migración de React a Angular 18
- Rediseño completo de la arquitectura utilizando **Angular 18**.
- Implementación de **Componentes Standalone** para una estructura moderna y ligera.
- Uso de **Bootstrap 5 + SCSS** con mixins personalizados inspirados en diseños de Figma.

### 2. Gestión de Estado con Angular Signals
- **WizardService**: Creación de un servicio centralizado que gestiona el estado global de los 7 pasos.
- **Persistencia Local**: Implementación de guardado automático en `localStorage` para recuperar la sesión tras recargar la página.
- **Reactividad**: Uso de señales (`signals`) y observables para una sincronización en tiempo real entre componentes.

### 3. Inteligencia Artificial (Gemini API)
- **GeminiExtractionService**: Integración con la API de Gemini para la digitalización y extracción automática de datos desde archivos PDF.
- **Mapeo Inteligente**: Conversión de respuestas planas de la API a modelos tipados complejos de pólizas y recibos.

---

## 🛠️ Detalle por Pasos del Wizard

### Paso 1: Importar Póliza
- Implementación de carga de archivos PDF.
- Vista previa del documento seleccionado.

### Paso 2: IA Extrae Información
- Visualización de la progresión de la extracción en tiempo real.
- Sincronización automática de datos del cliente, póliza e importes.

### Paso 3: Completar Datos Faltantes
- **Formulario Reactivo**: Validación de `email`, `teléfono` y **`dirección`** (nuevo campo añadido).
- **Calculadora de Comisiones**: Implementación de un slider interactivo que calcula comisiones sobre la marcha.
- **Resumen Premium**: Nuevo diseño tipo "SaaS Card" para el desglose de comisiones por recibo.

### Paso 4: Gestión de Recibos
- **Panel de Control**: Listado lateral de recibos con estados dinámicos (Pendiente, Pagado, Vencido).
- **Nueva Tarjeta de Detalle**: Visualización prominente del monto y vencimiento del recibo seleccionado.
- **Canales de Comunicación**: Envío simulado de recordatorios de pago por **Email, SMS y WhatsApp**.
- **Bitácora**: Registro histórico de acciones realizadas por cada recibo.

### Paso 5: Entrega y Renovación
- Modales para compartir la póliza (TuPoliza Email, App Móvil).
- Programación de recordatorios de renovación automática.

### Paso 6: Notificaciones Automáticas
- **Alertas Modulares**: Toggles para activar/desactivar notificaciones de cobranza, renovaciones, siniestros y comisiones.
- **Diseño Mejorado**: Iconografía multicanal para indicar qué alertas se envían por qué medio.

### Paso 7: Dashboard Final
- **KPIs Dinámicos**: Tarjetas estadísticas con métricas de la póliza actual.
- **Gráficas Interactivas**: Implementación de `ng-apexcharts` para visualizar la distribución de prima y rendimiento de cartera.
- **Cierre de Ciclo**: Botones de "Finalizar Digitalización" y "Procesar Nueva Póliza".
- **Animación de Éxito**: Feedback visual tipo "bounce" al completar el flujo.

---

## 🎨 Diseño y Standares

- **Estética SaaS Premium**: Uso de sombras suaves, gradientes profesionales y tipografía "Inter".
- **Accesibilidad (A11y)**: Cumplimiento de estándares **WCAG AA** en contraste de colores y navegación por teclado (IDs únicos y atributos `name`).
- **Responsividad**: Optimización para dispositivos móviles y tablets utilizando el grid de Bootstrap y media queries.
- **Auditoría**: Sistema de logs centralizado para el historial de extracciones.

---
