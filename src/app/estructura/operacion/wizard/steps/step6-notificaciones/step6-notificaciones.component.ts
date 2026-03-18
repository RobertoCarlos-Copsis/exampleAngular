import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step6-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './step6-notificaciones.component.html',
  styleUrls: ['./step6-notificaciones.component.scss']
})
export class Step6NotificacionesComponent {
  @Output() nextStep = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  state = this.wizardService.state;

  toggleNotification(key: string, event: MatSlideToggleChange) {
    const checked = event.checked;
    const currentNotifications = { ...this.state().notifications };
    currentNotifications[key] = { ...currentNotifications[key], active: checked };
    this.wizardService.updateState({ notifications: currentNotifications });
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
