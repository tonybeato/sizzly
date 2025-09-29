import { createBadge, version, UIButton, UIBadge } from 'sizzly';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append('Sizzly version: ' + version(), document.createElement('br'));

const badge = createBadge('Hello from Sizzly');
app.append(badge);

if (!customElements.get('ui-button')) {
  customElements.define('ui-button', UIButton);
}

const btn = document.createElement('ui-button');
btn.textContent = 'Click Me';
app.appendChild(btn);



if (!customElements.get('ui-badge')) {
  customElements.define('ui-badge', UIBadge)
}

const uiBadgeSuccess = document.createElement('ui-badge');
uiBadgeSuccess.textContent = 'Success';
app.appendChild(uiBadgeSuccess);