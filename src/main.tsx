import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { SupabaseProvider } from './contexts/SupabaseContext'

// Handler de erros global
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SupabaseProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </SupabaseProvider>
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
