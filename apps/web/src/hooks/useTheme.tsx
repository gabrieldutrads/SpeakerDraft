import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Resolve system theme
  const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((themeValue: Theme) => {
    const resolved = resolveTheme(themeValue);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('theme', themeValue);
  }, [resolveTheme]);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    const initialTheme = stored || 'system';
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // During SSR or before mount, return defaults
  if (!mounted) {
    return { theme: 'system', setTheme: () => {}, resolvedTheme: 'light' };
  }

  return { theme, setTheme, resolvedTheme };
}

/* ==========================================================================
   Theme Toggle Component
   ========================================================================== */

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const icons = {
    light: '☀️',
    dark: '🌙',
    system: '💻',
  };

  const labels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-subtle rounded-lg border border-border">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            theme === t
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
          aria-pressed={theme === t}
          aria-label={labels[t]}
        >
          <span aria-hidden="true">{icons[t]}</span>
          <span className="hidden sm:inline">{labels[t]}</span>
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   Theme Select (Dropdown)
   ========================================================================== */

export function ThemeSelect() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options = [
    { value: 'light' as Theme, label: 'Light', icon: '☀️' },
    { value: 'dark' as Theme, label: 'Dark', icon: '🌙' },
    { value: 'system' as Theme, label: 'System', icon: '💻' },
  ];

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="form-input w-auto px-3 py-2 text-sm bg-surface border-border"
      aria-label="Select theme"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.icon} {opt.label}
        </option>
      ))}
    </select>
  );
}