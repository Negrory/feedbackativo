import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Manipulador de erros global
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Wrapper de renderização segura
const SafeApp = () => {
  try {
    return <App />;
  } catch (error) {
    console.error('Error rendering App:', error);
    return (
      <div style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '100px'
      }}>
        <h2>Erro ao carregar a aplicação</h2>
        <p>Tente recarregar a página ou limpar o cache do navegador.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '8px 16px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Voltar para o início
        </button>
      </div>
    );
  }
};

try {
  const isProduction = window.location.hostname === 'negrory.github.io';
  const basename = isProduction ? '/feedbackativo' : '/';
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={basename}>
      <SafeApp />
    </BrowserRouter>
  );
} catch (error) {
  console.error('Root rendering error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; margin-top: 100px;">
      <h2>Erro crítico ao iniciar a aplicação</h2>
      <p>Por favor, tente novamente mais tarde ou contate o suporte.</p>
    </div>
  `;
}
