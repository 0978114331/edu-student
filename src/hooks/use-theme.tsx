import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('team-edu-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222 47% 11%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '222 47% 11%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222 47% 11%');
      root.style.setProperty('--primary', '217 91% 60%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '210 40% 96%');
      root.style.setProperty('--secondary-foreground', '222 47% 11%');
      root.style.setProperty('--muted', '210 40% 96%');
      root.style.setProperty('--muted-foreground', '215 16% 47%');
      root.style.setProperty('--accent', '199 89% 48%');
      root.style.setProperty('--accent-foreground', '222 47% 11%');
      root.style.setProperty('--destructive', '0 84% 60%');
      root.style.setProperty('--destructive-foreground', '0 0% 100%');
      root.style.setProperty('--success', '142 71% 45%');
      root.style.setProperty('--warning', '38 92% 50%');
      root.style.setProperty('--border', '214 32% 91%');
      root.style.setProperty('--input', '214 32% 91%');
      root.style.setProperty('--ring', '217 91% 60%');
    } else {
      root.classList.add('dark');
      root.style.setProperty('--background', '222 47% 6%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222 40% 9%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222 44% 8%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--primary', '217 91% 60%');
      root.style.setProperty('--primary-foreground', '222 47% 11%');
      root.style.setProperty('--secondary', '217 33% 17%');
      root.style.setProperty('--secondary-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '217 33% 14%');
      root.style.setProperty('--muted-foreground', '215 20% 65%');
      root.style.setProperty('--accent', '199 89% 48%');
      root.style.setProperty('--accent-foreground', '222 47% 11%');
      root.style.setProperty('--destructive', '0 72% 51%');
      root.style.setProperty('--destructive-foreground', '210 40% 98%');
      root.style.setProperty('--success', '142 71% 45%');
      root.style.setProperty('--warning', '38 92% 50%');
      root.style.setProperty('--border', '217 33% 17%');
      root.style.setProperty('--input', '217 33% 17%');
      root.style.setProperty('--ring', '217 91% 60%');
    }
    localStorage.setItem('team-edu-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
