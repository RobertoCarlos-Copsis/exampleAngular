import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step6-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './step6-notificaciones.component.html',
  styleUrls: ['./step6-notificaciones.component.scss']
})
export class Step6NotificacionesComponent {
  @Output() nextStep = new EventEmitter<void>();

  state = this.wizardService.state;

  constructor(private wizardService: WizardService) { }

  toggleNotification(key: string, event: any) {
    const currentNotifications = { ...this.state().notifications };
    currentNotifications[key] = { active: event.checked };
    this.wizardService.updateState({ notifications: currentNotifications });
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
