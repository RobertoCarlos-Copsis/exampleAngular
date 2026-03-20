import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';

import { WizardComponent } from './wizard.component';
import { Step1ImportarComponent } from './steps/step1-importar/step1-importar.component';
import { Step2ExtraccionComponent } from './steps/step2-extraccion/step2-extraccion.component';
import { Step3CompletarComponent } from './steps/step3-completar/step3-completar.component';
import { Step4RecibosComponent } from './steps/step4-recibos/step4-recibos.component';
import { Step5PolizaComponent } from './steps/step5-poliza/step5-poliza.component';
import { Step6NotificacionesComponent } from './steps/step6-notificaciones/step6-notificaciones.component';
import { Step7EstadisticasComponent } from './steps/step7-estadisticas/step7-estadisticas.component';

// Componentes compartidos que el Wizard usa

@NgModule({
  declarations: [
    WizardComponent,
    Step1ImportarComponent,
    Step2ExtraccionComponent,
    Step3CompletarComponent,
    Step4RecibosComponent,
    Step5PolizaComponent,
    Step6NotificacionesComponent,
    Step7EstadisticasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgApexchartsModule
  ],
  exports: [
    WizardComponent
  ],
  providers: [
    DecimalPipe,
    CurrencyPipe
  ]
})
export class WizardModule { }
