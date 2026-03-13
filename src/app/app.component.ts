import { Component } from '@angular/core';
import { WizardComponent } from './estructura/operacion/wizard/wizard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WizardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pruebas';
}
