import React from 'react';
import { Routes, Route } from "react-router-dom";
import Index from './pages/Index';
import Consulta from './pages/Consulta';
import Dashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import AdicionarVeiculo from './pages/admin/AdicionarVeiculo';
import VistoriaEntrada from './pages/admin/VistoriaEntrada';
import Relatorios from './pages/admin/Relatorios';
import Atualizacoes from './pages/admin/Atualizacoes';
import AguardandoAprovacao from './pages/admin/AguardandoAprovacao';
import Veiculos from './pages/admin/Veiculos';
import Oficinas from './pages/admin/Oficinas';

const App = () => {
  console.log('App component is rendering');
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="consulta" element={<Consulta />} />
      <Route path="admin/dashboard" element={<Dashboard />} />
      <Route path="admin/adicionar-veiculo" element={<AdicionarVeiculo />} />
      <Route path="admin/vistoria-entrada" element={<VistoriaEntrada />} />
      <Route path="admin/relatorios" element={<Relatorios />} />
      <Route path="admin/atualizacoes" element={<Atualizacoes />} />
      <Route path="admin/aguardando-aprovacao" element={<AguardandoAprovacao />} />
      <Route path="admin/veiculos" element={<Veiculos />} />
      <Route path="admin/oficinas" element={<Oficinas />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
