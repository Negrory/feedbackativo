import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import Consulta from './pages/Consulta';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import AdicionarVeiculo from './pages/admin/AdicionarVeiculo';
import VistoriaEntrada from './pages/admin/VistoriaEntrada';
import Relatorios from './pages/admin/Relatorios';
import Atualizacoes from './pages/admin/Atualizacoes';
import AguardandoAprovacao from './pages/admin/AguardandoAprovacao';
import Veiculos from './pages/admin/Veiculos';
import Oficinas from './pages/admin/Oficinas';
import ProtectedRoute from './components/ui/ProtectedRoute';

const App = () => {
  return (
    <>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="consulta" element={<Consulta />} />
        <Route path="login" element={<Login />} />
        
        {/* Rotas protegidas (admin) */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/adicionar-veiculo" element={
          <ProtectedRoute>
            <AdicionarVeiculo />
          </ProtectedRoute>
        } />
        <Route path="admin/vistoria-entrada" element={
          <ProtectedRoute>
            <VistoriaEntrada />
          </ProtectedRoute>
        } />
        <Route path="admin/relatorios" element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        } />
        <Route path="admin/atualizacoes" element={
          <ProtectedRoute>
            <Atualizacoes />
          </ProtectedRoute>
        } />
        <Route path="admin/aguardando-aprovacao" element={
          <ProtectedRoute>
            <AguardandoAprovacao />
          </ProtectedRoute>
        } />
        <Route path="admin/veiculos" element={
          <ProtectedRoute>
            <Veiculos />
          </ProtectedRoute>
        } />
        <Route path="admin/oficinas" element={
          <ProtectedRoute>
            <Oficinas />
          </ProtectedRoute>
        } />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
