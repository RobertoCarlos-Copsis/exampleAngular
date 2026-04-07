import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'qcrm-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Force light mode
    this.isDarkMode.set(false);
    document.body.classList.remove('dark-mode');
    localStorage.setItem(this.THEME_KEY, 'light');
  }

  toggleTheme() {
    // Disabled
  }
}
