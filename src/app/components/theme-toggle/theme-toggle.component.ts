import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const STORAGE_KEY = 'geo-locator-theme';
type Theme = 'light' | 'dark';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ThemeToggleComponent implements OnInit {
  private document = inject(DOCUMENT);
  protected theme = signal<Theme>('light');

  ngOnInit(): void {
    // Determine initial theme: localStorage > prefers-color-scheme > light
    let initial: Theme = 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        initial = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark';
      }
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
    this.applyTheme(initial);
  }

  protected toggle(): void {
    const next: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  private applyTheme(t: Theme): void {
    this.theme.set(t);
    this.document.documentElement.setAttribute('data-theme', t);
  }
}
