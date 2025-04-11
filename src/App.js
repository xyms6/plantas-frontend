import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { FaLeaf, FaGithub, FaSeedling, FaSyncAlt } from 'react-icons/fa';
import './App.css';
import Home from './pages/Home/Home';
import PlantDetail from './pages/PlantDetail/PlantDetail';
import PlantEdit from './pages/PlantEdit/PlantEdit';
import plantasService from './services/api';

function App() {
  const [apiStatus, setApiStatus] = useState('verificando');
  const [pendingCount, setPendingCount] = useState(0);
  
  // Verificar status da API e plantas pendentes
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await plantasService.ping();
        setApiStatus('conectado');
      } catch (error) {
        setApiStatus('desconectado');
      }
    };
    
    const getPendingCount = () => {
      const pendingPlants = localStorage.getItem('plantas_pending_uploads');
      if (pendingPlants) {
        try {
          const count = JSON.parse(pendingPlants).length;
          setPendingCount(count);
        } catch (e) {
          setPendingCount(0);
        }
      }
    };
    
    checkApiStatus();
    getPendingCount();
    
    // Verificar periodicamente
    const intervalId = setInterval(() => {
      checkApiStatus();
      getPendingCount();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo">
              <FaLeaf className="logo-icon" />
              <span className="logo-text">Jardim <strong>Botânico</strong></span>
            </Link>
            
            <nav className="nav-menu">
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
                Início
              </NavLink>
              
              {pendingCount > 0 && (
                <NavLink to="/pendentes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <FaSyncAlt className="nav-icon" />
                  Pendentes
                  <span className="badge">{pendingCount}</span>
                </NavLink>
              )}
              
              <div className={`api-indicator ${apiStatus}`}>
                <span className="status-dot"></span>
                {apiStatus === 'conectado' ? 'Online' : 'Offline'}
              </div>
            </nav>
          </div>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planta/:id" element={<PlantDetail />} />
            <Route path="/planta/editar/:id" element={<PlantEdit />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-info">
              <FaSeedling className="footer-icon" />
              <p>Catalogando e preservando a biodiversidade vegetal</p>
            </div>
            
            <div className="footer-links">
              <a 
                href="https://github.com/xyms6/plantas-frontend"
                className="footer-link"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FaGithub /> GitHub
              </a>
            </div>
          </div>
          
          <div className="copyright">
            © {new Date().getFullYear()} Jardim Botânico - Todos os direitos reservados
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
