import { createBadge, version } from 'sizzly';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append('Sizzly version: ' + version(), document.createElement('br'));

const badge = createBadge('Hello from Sizzly');
app.append(badge);
