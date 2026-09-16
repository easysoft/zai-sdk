/** Progressive enhancement only: all documentation remains readable without JS. */
(() => {
  document.body.classList.add('enhanced');
  const search = document.querySelector<HTMLInputElement>('#doc-search')!;
  const clear = document.querySelector<HTMLButtonElement>('#clear-search')!;
  const results = document.querySelector<HTMLElement>('#search-results')!;
  const list = document.querySelector<HTMLUListElement>('#search-list')!;
  const status = document.querySelector<HTMLElement>('#search-status')!;
  const sidebar = document.querySelector<HTMLElement>('#sidebar')!;
  const menu = document.querySelector<HTMLButtonElement>('#menu-toggle')!;
  const toast = document.querySelector<HTMLElement>('#copy-status')!;
  const entries = [...document.querySelectorAll<HTMLElement>('[data-search-entry]')].map(element => ({
    id: element.id,
    title: element.dataset.searchTitle!,
    kind: element.dataset.searchKind!,
    text: (element.textContent ?? '').replace(/\s+/g, ' ').toLocaleLowerCase(),
  }));
  let composing = false;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function runSearch(): void {
    if (composing) return;
    const query = search.value.trim().toLocaleLowerCase();
    clear.hidden = search.value.length === 0;
    results.hidden = !query;
    list.replaceChildren();
    if (!query) return;
    const terms = query.split(/\s+/);
    const matches = entries.filter(entry => terms.every(term => `${entry.title.toLocaleLowerCase()} ${entry.text}`.includes(term)))
      .sort((a, b) => Number(b.title.toLocaleLowerCase().includes(query)) - Number(a.title.toLocaleLowerCase().includes(query)));
    status.textContent = matches.length ? `找到 ${matches.length} 项结果` : '没有找到相关内容。试试资源名、方法名或参数，例如 messages.stream。';
    for (const entry of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${entry.id}`;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const context = document.createElement('span');
      context.textContent = entry.kind;
      link.append(title, context);
      item.append(link);
      list.append(item);
    }
  }
  search.addEventListener('compositionstart', () => { composing = true; });
  search.addEventListener('compositionend', () => { composing = false; runSearch(); });
  search.addEventListener('input', runSearch);
  search.addEventListener('focus', runSearch);
  search.addEventListener('keydown', event => {
    if (composing || event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      const first = list.querySelector<HTMLAnchorElement>('a');
      if (first && !results.hidden) { event.preventDefault(); first.focus(); }
    }
  });
  clear.addEventListener('click', () => { search.value = ''; runSearch(); search.focus(); });

  function closeMenu(): void { sidebar.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    if (open) sidebar.querySelector<HTMLAnchorElement>('a')?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.isComposing || composing) return;
    const target = event.target as HTMLElement;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !target.closest('input, textarea, [contenteditable="true"]')) {
      event.preventDefault(); search.focus();
    }
    if (event.key === 'Escape') {
      if (!results.hidden) { results.hidden = true; search.focus({preventScroll: true}); results.hidden = true; }
      if (sidebar.classList.contains('is-open')) { closeMenu(); menu.focus(); }
    }
  });
  document.addEventListener('click', event => {
    if (!(event.target as HTMLElement).closest('.search-box')) results.hidden = true;
  });
  document.addEventListener('focusin', event => {
    if (!(event.target as HTMLElement).closest('.search-box')) results.hidden = true;
  });

  function reveal(hash: string, moveFocus = false): void {
    let id: string;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let parent: HTMLElement | null = target;
    while (parent) { if (parent instanceof HTMLDetailsElement) parent.open = true; parent = parent.parentElement; }
    requestAnimationFrame(() => {
      // Native fragment navigation can reset focus; restore it after that step.
      if (moveFocus) {
        const focus = target instanceof HTMLDetailsElement ? target.querySelector<HTMLElement>('summary') : target.querySelector<HTMLElement>('h1, h2, h3') ?? target;
        if (focus) { if (!focus.matches('summary, a, button')) focus.tabIndex = -1; focus.focus({preventScroll: true}); }
      }
      target.scrollIntoView({block: 'start'});
    });
  }
  document.addEventListener('click', event => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Keep a real history entry without the browser's fragment-focus reset.
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    closeMenu();
    results.hidden = true;
    reveal(link.hash, true);
  });
  window.addEventListener('hashchange', () => reveal(location.hash));
  window.addEventListener('popstate', () => reveal(location.hash || '#overview', true));
  if (location.hash) reveal(location.hash);

  document.addEventListener('click', async event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
    if (!button) return;
    const block = button.closest('.code-block')?.querySelector('code');
    if (!block) return;
    let copied = false;
    try { await navigator.clipboard.writeText(block.textContent ?? ''); copied = true; } catch { /* Local-file contexts may deny the Clipboard API. */ }
    if (!copied) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(block);
      selection?.removeAllRanges();
      selection?.addRange(range);
      try { copied = document.execCommand('copy'); } catch { /* Leave the text selected for manual copying. */ }
      if (copied) selection?.removeAllRanges();
    }
    toast.textContent = copied ? '代码已复制' : '代码已选中，请按 Ctrl+C 或 ⌘C 复制。';
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  });

  const navigation = [...sidebar.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const targets = navigation.map(link => ({link, element: document.getElementById(link.hash.slice(1))})).filter(item => item.element);
  let scrollPending = false;
  const updateNavigation = () => {
    const margin = window.innerWidth <= 700 ? 145 : 110;
    const current = [...targets].reverse().find(item => item.element!.getBoundingClientRect().top <= margin) ?? targets[0];
    for (const item of targets) {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateNavigation); }
  }, {passive: true});
  updateNavigation();

  const printOpened = new Set<HTMLDetailsElement>();
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll<HTMLDetailsElement>('.operation, .type-entry, .faq').forEach(detail => {
      if (!detail.open) { printOpened.add(detail); detail.open = true; }
    });
  });
  window.addEventListener('afterprint', () => { printOpened.forEach(detail => { detail.open = false; }); printOpened.clear(); });
})();
