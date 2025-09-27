import './styles.css';

export function createBadge(text: string): HTMLElement {
  const el = document.createElement('span');
  el.className = 'sizzly-badge';
  el.textContent = text;
  return el;
}

export function version(): string {
  return '1.0.0';
}
