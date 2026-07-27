import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'theme';

  initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey);

    const theme = savedTheme === 'dark' ? 'dark' : 'light';

    this.applyTheme(theme);
  }

  toggleTheme(): string {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    this.applyTheme(newTheme);

    return newTheme;
  }

  getCurrentTheme(): string {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem(this.storageKey, theme);
  }
}
