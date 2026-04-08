import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsistenteService } from '../../../../../core/services/asistente.service';
import { Recibo, EstadoRecibo } from '../../../../../core/models/wizard.model';

@Component({
  selector: 'app-step4-recibos',
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step4RecibosComponent {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  estado = this.servicioAsistente.estado;

  mostrarBitacora = false;
  indiceActivo = 0;
  exitoAccion: { tipo: string, mensaje: string } | null = null;
  dialogoActivo: { tipo: string, titulo: string, subtitulo: string, icono: string } | null = null;
  textoAccion = '';
  enviando = false;

  elementosBitacora = [
    { fecha: 'Hoy, 10:24 AM', evento: 'Recibo detectado por IA', icono: 'auto_awesome', color: 'blue' },
    { fecha: 'Ayer, 03:15 PM', evento: 'Póliza digitalizada correctamente', icono: 'description', color: 'green' }
  ];


  get reciboActual(): Recibo {
    return this.estado().recibos[this.indiceActivo] || { id: 0, estado: EstadoRecibo.Pendiente, vencimiento: '15/04/2025', prima: 0, periodo: '' };
  }

  seleccionarRecibo(indice: number) {
    this.indiceActivo = indice;
  }

  abrirBitacora() {
    this.mostrarBitacora = true;
  }

  cerrarBitacora() {
    this.mostrarBitacora = false;
  }

  cerrarDialogo() {
    this.dialogoActivo = null;
    this.exitoAccion = null;
    this.enviando = false;
  }

  alHacerClicAccion(accion: string) {
    if (accion === 'Bitácora') {
      this.abrirBitacora();
      return;
    }

    const cliente = this.estado().cliente;
    const poliza = this.estado().poliza.datos;
    const monto = this.reciboActual.prima;
    const montoFormateado = monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    const fechaVencimiento = this.reciboActual.vencimiento || 'pronto';

    const mapaIconos: Record<string, string> = {
      'Email': 'mail',
      'SMS': 'smartphone',
      'WhatsApp': 'chat'
    };

    this.dialogoActivo = {
      tipo: accion,
      titulo: `Enviar ${accion}`,
      subtitulo: `Comunicación para Recibo ${this.indiceActivo + 1}`,
      icono: mapaIconos[accion] || 'info'
    };

    if (accion === 'Email') {
      this.textoAccion = `Estimado ${cliente.nombre},\n\nLe informamos que su recibo por ${montoFormateado} de la póliza ${poliza.numeroPoliza} vence el ${fechaVencimiento}. Puede realizar su pago de forma segura en el siguiente enlace:\n\nhttps://quattrocrm.mx/pago\n\nQuedamos a sus órdenes.`;
    } else if (accion === 'SMS') {
      this.textoAccion = `Q-Seguros: Hola ${cliente.nombre}, tu recibo de ${montoFormateado} vence el ${fechaVencimiento}. Paga aquí: https://q-seg.mx/p`;
    } else if (accion === 'WhatsApp') {
      this.textoAccion = `Hola *${cliente.nombre}*! 👋\n\nTe saludo de Q-Seguros. Te comparto tu link de pago para el recibo de ${montoFormateado} con vencimiento al ${fechaVencimiento}:\n\n🔗 https://wa.link/pago-seguros\n\nQuedo a tus órdenes.`;
    }
  }

  confirmarAccion() {
    if (!this.dialogoActivo) return;

    this.enviando = true;

    // Simular retraso de red
    setTimeout(() => {
      this.enviando = false;
      this.exitoAccion = {
        tipo: this.dialogoActivo!.tipo,
        mensaje: `¡${this.dialogoActivo!.tipo} enviado exitosamente a ${this.dialogoActivo!.tipo === 'Email' ? this.estado().cliente.email : this.estado().cliente.telefono}!`
      };

      const mapaColores: Record<string, string> = {
        'Email': 'blue',
        'SMS': 'pink',
        'WhatsApp': 'green'
      };

      // Agregar a la bitácora
      this.elementosBitacora.unshift({
        fecha: 'Hace un momento',
        evento: `${this.dialogoActivo!.tipo} enviado: ${this.dialogoActivo!.tipo === 'Email' ? 'Recordatorio de pago' : 'Link de cobro'}`,
        icono: this.dialogoActivo!.icono,
        color: mapaColores[this.dialogoActivo!.tipo] || 'gray'
      });

      setTimeout(() => {
        this.cerrarDialogo();
      }, 2000);
    }, 1500);
  }

  alternarPagado(indice: number) {
    const recibos = [...this.estado().recibos];
    const r = { ...recibos[indice] };
    r.estado = r.estado === EstadoRecibo.Pagado ? EstadoRecibo.Pendiente : EstadoRecibo.Pagado;
    recibos[indice] = r;
    this.servicioAsistente.actualizarEstado({ recibos });

    // Agregar a la bitácora
    this.elementosBitacora.unshift({
      fecha: 'Hace un momento',
      evento: `Estado cambiado a: ${r.estado}`,
      icono: r.estado === EstadoRecibo.Pagado ? 'check_circle' : 'pending',
      color: r.estado === EstadoRecibo.Pagado ? 'green' : 'yellow'
    });
  }

  alContinuar() {
    this.servicioAsistente.siguientePaso();
    this.siguientePaso.emit();
  }

  get totalPrimas() {
    return (this.estado().recibos || []).reduce((acc: number, r: Recibo) => acc + (r.prima || 0), 0);
  }

  get comisionEstimada() {
    const pct = this.estado().porcentajeComision || 0;
    return (this.totalPrimas * pct) / 100;
  }

  get esFormularioValido(): boolean {
    if (!this.dialogoActivo) return true;

    // Validar mensaje no vacío
    if (!this.textoAccion || this.textoAccion.trim().length === 0) return false;

    // Validar según tipo
    if (this.dialogoActivo.tipo === 'Email') {
      const email = this.estado().cliente.email;
      return !!email && email.includes('@');
    } else {
      const telefono = this.estado().cliente.telefono;
      return !!telefono && telefono.trim().length >= 8;
    }
  }
  rastrearPorIdRecibo(_indice: number, recibo: Recibo): number {
    return recibo.id;
  }

  rastrearPorIndice(indice: number): number {
    return indice;
  }
}
