/** Runs in <head> before CSS so a saved appearance is applied before first paint. */
(() => {
  const storageKey = 'zai-sdk-docs-theme';
  type Theme = 'system' | 'light' | 'dark';
  const normalize = (value: string | null): Theme => value === 'light' || value === 'dark' ? value : 'system';
  const readPreference = (): Theme => {
    try { return normalize(localStorage.getItem(storageKey)); } catch { return 'system'; }
  };
  const root = document.documentElement;
  root.dataset.theme = readPreference();

  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector<HTMLSelectElement>('#theme-select')!;
    const apply = (theme: Theme) => { root.dataset.theme = theme; select.value = theme; };
    apply(normalize(root.dataset.theme ?? null));
    document.querySelector<HTMLElement>('.theme-control')!.hidden = false;
    select.addEventListener('change', () => {
      const theme = normalize(select.value);
      apply(theme);
      try {
        if (theme === 'system') localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, theme);
      } catch { /* The current page still switches when browser storage is unavailable. */ }
    });
    window.addEventListener('storage', event => {
      if (event.key === storageKey || event.key === null) apply(readPreference());
    });
  });
})();
