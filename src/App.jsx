// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import PluginListPage from './pages/PluginListPage';
import ScriptListPage from './pages/ScriptListPage';
import HowToInstallPage from './pages/HowToInstallPage';
import NotFoundPage from './pages/NotFoundPage';

// Common components
import Header from './components/Header';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';

function App() {
  
  return (
    <Router basename="AviUtl2_Plugins">
      <div className="app">
        <Header />
        <Breadcrumbs />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PluginListPage />} />
            <Route path="/scripts" element={<ScriptListPage />} />
            <Route path="/how-to-install" element={<HowToInstallPage />} />
            
            {/* リダイレクト用の古いパス */}
            <Route path="/plugins" element={<Navigate to="/" replace />} />
            
            {/* 404ページ */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;