export function createBadge(text: string): HTMLElement {
  const el = document.createElement('span');
  el.className = 'sizzly-badge';
  el.textContent = text;
  return el;
}