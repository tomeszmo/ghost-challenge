import './styles/main.css';
import { App } from './app';

const container = document.getElementById('app');
if (!container) throw new Error('#app root element not found');

new App(container).init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/challengeghost/sw.js').catch(() => {});
  });
}
