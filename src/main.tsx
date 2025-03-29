import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Determina o basename com base no ambiente
const isProduction = window.location.hostname === 'negrory.github.io';
const basename = isProduction ? '/feedbackativo' : '/';

// Handler de erros global
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erro de renderização:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; margin-top: 100px;">
      <h2>Erro crítico ao iniciar a aplicação</h2>
      <p>Por favor, tente novamente mais tarde ou contate o suporte.</p>
    </div>
  `;
}
